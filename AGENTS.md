# Project overview
- This is a Visual Studio Code extension project primarily concerned with sharing `vscode://` links that execute arbitrary commands when clicked. For instance, clicking a link my instruct VS Code to open a specific file and go to a specific line.

# Guidelines
- Keep documentation additions/edits to a minimum as the project hasn't stabilized.
- Do not worry about semver (semantic versioning) or breaking changes yet.
- Keep comments in the code to a minimum; prefer creating new named symbols (variables, methods/functions, types/classes) to express how/why things work the way they do.
- Prefer object-oriented and functional programmming practices over procedural.
- Prefer passing objects to methods over primitive types.
- Look for opportunities to follow the DRY (Don't Repeat Yourself) principle.
- When told to revise something you previously did, consider asking if this file should be updated to avoid repeating past mistakes.
- Follow the `.editorconfig` and offer suggestions to update it when appropriate. If something is ambiguous because it's unspecified, ask.
- When the user asks clarifying questions, respond with answers only - do not make any code changes.

## Tool and Terminal Usage
- Always prefer built-in tools (`list_dir`, `read_file`, `grep_search`, `file_search`) over terminal commands for inspection tasks.
- For terminal operations, prefer in order:
  1. Bun for package scripts (`bun run build`, `bun test`), installation (`bun install`), and bundling
  2. PowerShell for git, file operations, and system commands
- Never use terminal commands to inspect files when built-in tools can do it.