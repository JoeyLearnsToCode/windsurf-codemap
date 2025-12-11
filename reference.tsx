import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  MessageSquare, 
  Share2, 
  GitFork,
  FileCode,
  Info,
  Search,
  Code
} from 'lucide-react';

// --- 数据模拟 (Mock Data based on screenshots) ---

const codemapData = [
  {
    id: "trace-1",
    type: "trace",
    step: "1",
    title: "Codemap工具定义与JSON数据结构",
    description: "后端API系统中create_code_map工具的定义，规定了Codemap JSON的标准结构。",
    expanded: true,
    children: [
      {
        id: "t1-root",
        label: "Codemap工具定义与调用流程",
        children: [
          {
            id: "t1-api",
            label: "API工具注册系统",
            children: [
              {
                id: "t1-list",
                label: "工具列表定义",
                children: [
                  {
                    id: "1a",
                    type: "location",
                    step: "1a",
                    title: "工具定义入口",
                    file: "server.self-serve.windsurf.com...json:283",
                    code: '"name": "create_code_map",',
                    lang: "json"
                  },
                  {
                    id: "1b",
                    type: "location",
                    step: "1b",
                    title: "工具使用说明",
                    file: "server.self-serve.windsurf.com...json:284",
                    code: '"description": "Use this tool to create a codema...',
                    lang: "json"
                  },
                  {
                    id: "1c",
                    type: "location",
                    step: "1c",
                    title: "JSON Schema定义",
                    file: "server.self-serve.windsurf.com...json:285",
                    code: '"parameters_json": "{\\"$schema\\":\\"https://json-schema...',
                    lang: "json"
                  }
                ]
              },
              {
                id: "t1-handler",
                label: "工具调用处理器",
                children: [{ id: "t1-validate", label: "参数验证" }]
              }
            ]
          },
          {
            id: "t1-ai",
            label: "AI模型调用",
            children: [
              { id: "t1-req", label: "接收用户请求" },
              { id: "t1-sel", label: "选择create_code_map工具" },
              {
                id: "t1-gen",
                label: "生成JSON参数",
                children: [
                  {
                    id: "1d",
                    type: "location",
                    step: "1d",
                    title: "实际JSON数据示例",
                    file: "server.self-serve.windsurf.com...json:5768",
                    code: '"arguments_json": "{\\"codeMap\\": {\\"title\\": \\"BestSub...',
                    lang: "json"
                  },
                  { id: "t1-title", label: "title字段" },
                  { id: "t1-desc", label: "description字段" },
                  { id: "t1-traces", label: "traces数组", children: [{ id: "t1-locs", label: "locations数组" }] }
                ]
              }
            ]
          },
          {
            id: "t1-resp",
            label: "响应返回",
            children: [{ id: "t1-json-fe", label: "JSON数据传输到前端" }]
          }
        ]
      }
    ]
  },
  {
    id: "trace-2",
    type: "trace",
    step: "2",
    title: "树状列表视图渲染：从JSON到DOM元素",
    description: "前端渲染系统中，解析Codemap JSON并创建树状HTML结构的完整流程。",
    expanded: false,
    children: [] // Simplified for demo
  },
  {
    id: "trace-3",
    type: "trace",
    step: "3",
    title: "SVG Diagram视图：图形化节点和连线渲染",
    description: "IDE集成系统中的trace-glyph机制，使用SVG创建节点图和连线的可视化表示。",
    expanded: true,
    children: [
      {
        id: "t3-sys",
        label: "SVG Diagram视图渲染系统",
        children: [
          {
            id: "t3-css",
            label: "CSS样式系统",
            children: [
              {
                id: "3a",
                type: "location",
                step: "3a",
                title: "CSS样式定义",
                file: "workbench.desktop.main.css:3",
                code: ".trace-glyph",
                lang: "css"
              }
            ]
          },
          {
            id: "t3-gen",
            label: "SVG生成函数",
            children: [
              {
                id: "t3-func",
                label: "a(i,e=!1)函数入口",
                children: [
                  {
                    id: "3b",
                    type: "location",
                    step: "3b",
                    title: "SVG容器创建",
                    file: "workbench.desktop.main.js:4363",
                    code: 'a(i,e=!1){const t=Ni();return`<svg width="16" height="1...',
                    lang: "javascript"
                  },
                  {
                    id: "3c",
                    type: "location",
                    step: "3c",
                    title: "SVG文本节点渲染",
                    file: "workbench.desktop.main.js:4364",
                    code: '<text x="8" y="12" text-anchor="middle" font-family...',
                    lang: "html"
                  }
                ]
              }
            ]
          },
          {
            id: "t3-inject",
            label: "样式注入流程",
            children: [
              {
                id: "t3-rule",
                label: "生成CSS规则",
                children: [
                  {
                    id: "3d",
                    type: "location",
                    step: "3d",
                    title: "SVG背景注入",
                    file: "workbench.desktop.main.js:4350",
                    code: "background: url('data:image/svg+xml;base64,${r}') no-rep...",
                    lang: "css"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// --- 组件 ---

// 1. 代码高亮模拟组件
const SyntaxHighlight = ({ code, lang }) => {
  // 简单的基于正则的高亮，模拟截图中的效果
  const renderParts = () => {
    if (lang === 'json') {
      const parts = code.split(/(".*?")/g).filter(Boolean);
      return parts.map((part, i) => {
        if (part.startsWith('"')) {
          if (part.endsWith(':')) {
            return <span key={i} className="text-[#9cdcfe]">{part}</span>; // Key color
          }
          return <span key={i} className="text-[#ce9178]">{part}</span>; // String color
        }
        return <span key={i} className="text-[#d4d4d4]">{part}</span>;
      });
    }
    if (lang === 'css' || lang === 'javascript' || lang === 'html') {
      // 简化处理：关键字和字符串
      return (
        <span>
          <span className="text-[#569cd6]">{code.split(' ')[0]} </span>
          <span className="text-[#ce9178]">{code.substring(code.indexOf(' '))}</span>
        </span>
      )
    }
    return <span className="text-[#d4d4d4]">{code}</span>;
  };

  return (
    <div className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
      {renderParts()}
    </div>
  );
};

// 2. 树节点组件 (Recursive)
const TreeNode = ({ node, level = 0, isLastChild = false }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default open for demo

  // 缩进样式
  const paddingLeft = `${level * 20 + 24}px`;
  
  // 判断节点类型
  const isTraceRoot = node.type === 'trace';
  const isLocation = node.type === 'location';
  const hasChildren = node.children && node.children.length > 0;

  // 展开折叠处理
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (isTraceRoot) {
    return (
      <div className="border-b border-[#2b2b2b] last:border-0">
        <div 
          className="flex items-center py-2 px-2 hover:bg-[#2a2d2e] cursor-pointer group select-none"
          onClick={toggleExpand}
        >
          <div className="mr-2 text-[#c5c5c5]">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <span className="text-[#c5c5c5] font-bold mr-2 text-sm">{node.step}</span>
              <span className="text-[#cccccc] font-bold text-sm truncate">{node.title}</span>
            </div>
            {isExpanded && node.description && (
              <div className="text-[#8b949e] text-xs leading-relaxed ml-0 mb-1 pr-4">
                {node.description}
                <span className="text-[#3794ff] hover:underline cursor-pointer ml-1">See more</span>
              </div>
            )}
          </div>
        </div>
        {isExpanded && node.children && (
          <div className="relative">
             {/* 根层级的连接线 */}
            <div className="absolute left-[19px] top-0 bottom-2 w-[1px] bg-[#404040]"></div>
            {node.children.map((child, idx) => (
              <TreeNode 
                key={child.id} 
                node={child} 
                level={0} 
                isLastChild={idx === node.children.length - 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 渲染Location节点 (带有代码块的叶子节点)
  if (isLocation) {
    return (
      <div className="relative group">
        {/* 垂直连接线 */}
        <div className="absolute left-[19px] top-[-10px] bottom-0 w-[1px] bg-[#404040]" style={{left: `${level * 20 + 19}px`}}></div>
        {/* 水平连接线 (可选，截图里主要是垂直线) */}
        
        <div 
          className="relative py-1 pr-2 hover:bg-[#2a2d2e] cursor-pointer border-l-2 border-transparent hover:border-[#007fd4] transition-colors"
          style={{ paddingLeft: paddingLeft }}
        >
           {/* 高亮背景容器 */}
          <div className="bg-[#252526] rounded px-2 py-1.5 border border-[#3e3e3e] hover:border-[#505050] transition-colors shadow-sm">
             <div className="flex items-start justify-between mb-1">
                <div className="flex items-center overflow-hidden">
                  <span className="text-[#c5c5c5] font-bold mr-2 text-xs bg-[#333333] px-1.5 rounded">{node.step}</span>
                  <span className="text-[#cccccc] text-xs font-semibold truncate">{node.title}</span>
                </div>
                <div className="text-[#6a9955] text-[10px] truncate ml-2 opacity-80 max-w-[150px]">
                   {node.file}
                </div>
             </div>
             <div className="pl-0 mt-1 opacity-90">
               <SyntaxHighlight code={node.code} lang={node.lang} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染普通树节点 (文件夹/逻辑节点)
  return (
    <div className="relative">
      {/* 父级连线 */}
      {!isLastChild && (
        <div className="absolute top-0 bottom-0 w-[1px] bg-[#404040]" style={{ left: `${level * 20 + 19}px` }}></div>
      )}
      
      <div 
        className="flex items-center py-1 pr-2 hover:bg-[#2a2d2e] cursor-pointer select-none group"
        style={{ paddingLeft: `${level * 20 + 4}px` }} // 稍微调整缩进
        onClick={toggleExpand}
      >
         {/* 展开箭头 */}
        <div className={`p-0.5 rounded mr-1 text-[#c5c5c5] invisible ${hasChildren ? 'group-hover:visible' : ''}`}>
           {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-[14px]" />}
        </div>
        
        {/* 节点文本 */}
        <span className="text-[#cccccc] text-[13px] opacity-90 truncate hover:text-white transition-colors">
          {node.label}
        </span>
      </div>

      {/* 子节点 */}
      {isExpanded && node.children && (
        <div className="relative">
           {/* 当前层级的连线延续 */}
           <div className="absolute top-0 bottom-0 w-[1px] bg-[#404040]" style={{ left: `${level * 20 + 19}px` }}></div>
           
           {node.children.map((child, idx) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              isLastChild={idx === node.children.length - 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 3. 主应用组件
const App = () => {
  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden select-none">
      {/* 头部 (Header) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#2b2b2b] shrink-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-white truncate">
              Windsurf Codemap双视图渲染系统：从JSON到树状列表和SVG图形
            </h1>
          </div>
          <div className="flex items-center text-xs text-[#8b949e] mt-1 space-x-2">
             <span className="flex items-center">
               <Info size={12} className="mr-1" /> Created 2025年12月8日 22:03
             </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
           <button className="p-1 hover:bg-[#313131] rounded text-[#c5c5c5]" title="Tree View"><GitFork size={16} /></button>
           <button className="p-1 hover:bg-[#313131] rounded text-[#c5c5c5]" title="Comments"><MessageSquare size={16} /></button>
           <button className="p-1 hover:bg-[#313131] rounded text-[#c5c5c5]" title="Share"><Share2 size={16} /></button>
           <button className="p-1 hover:bg-[#313131] rounded text-[#c5c5c5]" title="More Actions"><MoreHorizontal size={16} /></button>
        </div>
      </div>

      {/* 顶部描述区 */}
      <div className="px-4 py-3 border-b border-[#2b2b2b] bg-[#1e1e1e] shrink-0">
        <p className="text-[13px] leading-6 text-[#cccccc]">
          此codemap追踪Windsurf如何将Codemap JSON数据渲染成两种可切换的视图：树状列表视图和SVG Diagram视图。
          涵盖从工具定义<span className="text-[#3794ff] cursor-pointer hover:underline">[1a]</span>、
          JSON结构解析<span className="text-[#3794ff] cursor-pointer hover:underline">[2a]</span>、
          树状DOM渲染<span className="text-[#3794ff] cursor-pointer hover:underline">[2c]</span>到
          SVG图形系统<span className="text-[#3794ff] cursor-pointer hover:underline">[3b]</span>的完整流程。
        </p>
      </div>

      {/* 滚动内容区域 (Tree Body) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
         <div className="pb-10">
            {codemapData.map(trace => (
              <TreeNode key={trace.id} node={trace} />
            ))}
         </div>
      </div>

      {/* 底部状态栏 (Optional, for completeness) */}
      <div className="h-6 bg-[#007fd4] text-white text-xs flex items-center px-2 justify-between">
         <span>Codemap Active</span>
         <span>UTF-8</span>
      </div>

      {/* CSS for custom scrollbar (simulating VS Code scrollbar) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #424242;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f4f4f;
        }
        .monaco-tree-guide {
          border-left: 1px solid #404040;
        }
      `}</style>
    </div>
  );
};

export default App;