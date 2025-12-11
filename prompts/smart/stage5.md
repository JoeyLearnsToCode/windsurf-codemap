<additional_metadata>
NOTE: Open files and cursor position may not be related to the user's current request. Always verify relevance before assuming connection.

The USER presented this request to you on {{ current_date }}.
</additional_metadata>
<user_request>
For trace {{ trace_id }}, write a guide for people new to this code and system.

Don't refer to the trace, refer directly to the code and system it is about.
Cover topics in a natural order. Keep it very short and high signal. Motivate the code's existence by defining the problem it's solving in as tangible a way as possible.
Only say things you're very high confidence about; omit low-confidence speculation. Use trace labels like [1a] as citations when applicable.
Use **bold** for emphasis.
Use markdown section headers. The first section should be called "Motivation" and the second section should be called "Details".
Always respond in the user's language.

Output your guide within this XML tag:

<TRACE_GUIDE>
[your guide here]
</TRACE_GUIDE>

</user_request>