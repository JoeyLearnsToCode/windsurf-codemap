<additional_metadata>
NOTE: Open files and cursor position may not be related to the user's current request. Always verify relevance before assuming connection.

The USER presented this request to you on {{ current_date }}.
</additional_metadata>
<user_request>
For trace {{ trace_id }}, draw a concise tree showing how the locations relate. Add context nodes as necessary -- e.g. common ancestors, connectors (if A calls B calls C but only A and C were highlighted in the trace, you should add B as a node to the tree).

The tree should be like output of unix tree command. Nodes of the tree should use natural language + symbols.
Decorate the highlighted trace locations like "node title <-- 1a". You can only put at most one location id per title. Use each location id at least once.
Limit the line width of your output (before <--) to 50 characters. NEVER wrap lines.
Limit the tree to 5-15 nodes.
Avoid going past depth 10 in the tree.

Output your diagram within this XML tag:

<TRACE_TEXT_DIAGRAM>
[your diagram here]
</TRACE_TEXT_DIAGRAM>

Example:
<TRACE_TEXT_DIAGRAM>
Main Sampling Engine
├── _sampler() entrypoint
│   ├── while (running) <-- 4a
│   │   ├── for_each_interp() <-- 4c
│   │   │   └── for_each_thread()
│   │   │       └── thread.sample() <-- 4b
│   │   └── sleep_for(interval)
│   └── _start() / _stop() setup
└── sampler() entry point
    └── Py_BEGIN_ALLOW_THREADS
        └── sampler() <-- 5a

Secondary Entry Point
└── RPC entry point
    └── Py_BEGIN_ALLOW_THREADS
        └── sampler() <-- 5a
</TRACE_TEXT_DIAGRAM>

Always respond in the user's language.

</user_request>