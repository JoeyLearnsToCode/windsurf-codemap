const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				if (location) {
					console.error(`    ${location.file}:${location.line}:${location.column}:`);
				}
			});
			console.log('[watch] build finished');
		});
	},
};

/**
 * CSS extraction plugin - extracts CSS to separate file
 * @type {import('esbuild').Plugin}
 */
const cssExtractPlugin = {
	name: 'css-extract',
	setup(build) {
		const cssContents = [];

		// Intercept CSS imports
		build.onLoad({ filter: /\.css$/ }, async (args) => {
			const css = await fs.promises.readFile(args.path, 'utf8');
			cssContents.push(css);
			return {
				contents: '', // Return empty - we'll write CSS separately
				loader: 'js',
			};
		});

		// Write CSS file after build
		build.onEnd(async () => {
			if (cssContents.length > 0) {
				const outdir = path.dirname(build.initialOptions.outfile);
				const cssFile = path.join(outdir, 'main.css');
				await fs.promises.mkdir(outdir, { recursive: true });
				await fs.promises.writeFile(cssFile, cssContents.join('\n'));
				cssContents.length = 0; // Clear for next build
			}
		});
	},
};

/**
 * Copy prompts directory plugin - copies prompt templates to dist
 * @type {import('esbuild').Plugin}
 */
const copyPromptsPlugin = {
	name: 'copy-prompts',
	setup(build) {
		build.onEnd(async () => {
			const srcDir = path.join(__dirname, 'prompts');
			const destDir = path.join(__dirname, 'dist', 'prompts');

			// Recursively copy directory
			async function copyDir(src, dest) {
				await fs.promises.mkdir(dest, { recursive: true });
				const entries = await fs.promises.readdir(src, { withFileTypes: true });

				for (const entry of entries) {
					const srcPath = path.join(src, entry.name);
					const destPath = path.join(dest, entry.name);

					if (entry.isDirectory()) {
						await copyDir(srcPath, destPath);
					} else {
						await fs.promises.copyFile(srcPath, destPath);
					}
				}
			}

			if (fs.existsSync(srcDir)) {
				await copyDir(srcDir, destDir);
				console.log('[prompts] Copied prompt templates to dist/prompts');
			}
		});
	},
};

async function main() {
	// Extension build (Node.js platform)
	const extensionCtx = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			copyPromptsPlugin,
			esbuildProblemMatcherPlugin,
		],
	});

	// Webview build (Browser platform, React + CSS)
	const webviewCtx = await esbuild.context({
		entryPoints: ['webview/main.tsx'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/webview/main.js',
		logLevel: 'silent',
		plugins: [
			cssExtractPlugin,
			esbuildProblemMatcherPlugin,
		],
	});

	if (watch) {
		await Promise.all([extensionCtx.watch(), webviewCtx.watch()]);
	} else {
		await extensionCtx.rebuild();
		await webviewCtx.rebuild();
		await extensionCtx.dispose();
		await webviewCtx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
