# NODAL starter: fastest setup

1. Download and unzip this archive **inside** your existing hackathon project folder. You should see `HANDOFF.md`, `shared/`, `references/`, and `prompts/` in that folder.
2. Open that same folder in Cursor and Claude Code (two agent windows/sessions).
3. Paste `prompts/CURSOR.txt` into Cursor Agent mode.
4. Paste `prompts/CLAUDE_CODE.txt` into Claude Code.
5. Both may read the handoff/references, but Cursor writes only `web/`, Claude writes only `visualization/`.
6. Provide any Gemini API key via server-side environment variable, never in chat or Git. The coding agent should tell you the variable name it expects.
7. Keep a working web demo and submit before 3:45 PM ET.

If downloaded as individual files instead: put `HANDOFF.md` at the root and `network.json` in `shared/`, then add your reference images in `references/`.
