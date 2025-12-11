<additional_metadata>
NOTE: Open files and cursor position may not be related to the user's current request. Always verify relevance before assuming connection.

The USER presented this request to you on {{ current_date }}.
</additional_metadata>
<user_request>
For trace {{ trace_id }}, now add location decorations to all the context (non-highlighted) nodes in your tree diagram.

Re-emit the entire tree diagram, but this time add <-- path/to/file.js:34 decorations to every unlabeled node that you can identify a line for.
Please label as many nodes as possible. If the node describes a range of things, pick the most representative one to label. If the node is clearly referencing a specific line of code, it should be labeled.
Do not change the existing labels for a line if a label already exists! Location labels are higher priority.
Follow the syntax exactly: "node title <-- path/to/file.js:34".
Use absolute paths for all file locations. Do not include any other kinds of links (no URLs; only file paths).

Before outputting the new diagram, first write a brainstorming paragraph. In here first estimate a rough range, e.g. 5-15, of many new links you can add. Then go through each node; write its node name and then either:
1. write down its original label (like 1c) if it already had a label, or
2. write down the text content of the line of code you are linking them to, and then write down the file name & line number that code appears on, or
3. write down "no appropriate code link"

Output your brainstorming in <BRAINSTORMING> xml tag, and then your updated diagram within the TRACE_TEXT_DIAGRAM xml tag, like so:

<BRAINSTORMING>
...
</BRAINSTORMING>
<TRACE_TEXT_DIAGRAM>
[your complete diagram with all locations]
</TRACE_TEXT_DIAGRAM>

Example:
<TRACE_TEXT_DIAGRAM>
Main Sampling Engine
├── _sampler() entrypoint <-- /Users/aidan/project/src/components/engine/SamplerEngine.ts:123
│   ├── while (running) <-- 4a
│   │   ├── for_each_interp() <-- 4c
│   │   │   └── for_each_thread() <-- /Users/aidan/project/src/components/engine/SamplerEngine.ts:254
│   │   │       └── thread.sample() <-- 4b
│   │   └── sleep_for(interval) <-- /Users/aidan/project/src/components/engine/SamplerEngine.ts:200
│   └── _start() / _stop() setup <-- /Users/aidan/project/src/components/engine/SamplerEngine.ts:183
└── sampler() entry point <-- /Users/aidan/project/src/components/sampler/Sampler.ts:20
    └── Py_BEGIN_ALLOW_THREADS <-- /Users/aidan/project/src/constants/Threads.py:10
        └── sampler() <-- 5a

Secondary Entry Point
└── RPC entry point <-- /Users/aidan/project/src/components/rpc/RpcHandler.ts:45
    └── Py_BEGIN_ALLOW_THREADS <-- /Users/aidan/project/src/constants/Threads.py:10
        └── sampler() <-- 5a
</TRACE_TEXT_DIAGRAM>

Do not use any tools or do any more research, just emit the paragraph and updated diagram.
Always respond in the user's language.

</user_request>