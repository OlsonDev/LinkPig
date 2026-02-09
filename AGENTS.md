# Project overview
- This is a Visual Studio Code extension project concerned with sharing `vscode://` links that execute arbitrary commands when clicked. For instance, one may instruct VS Code to open a specific file and go to a specific line. Commands are executed in query string parameter order.

# Guidelines
- Keep documentation additions/edits to a minimum as the project hasn't stabilized.
- Do NOT worry about backwards compatibility/breaking changes/semver (semantic versioning) yet.
- Keep comments in the code to a minimum; prefer creating new named symbols (variables, methods/functions, types/classes) to express how/why things work the way they do.
- Prefer object-oriented and functional paradigms over procedural.
- Only put one type per file; this will keep git diffs clean and make it easier to see what has unit tests (see below).
- Prefer passing objects to methods over primitive types.
- Look for opportunities to follow the DRY (Don't Repeat Yourself) principle.
- When told to revise something you previously did, consider asking if this file should be updated to avoid repeating past mistakes.
- Follow the `.editorconfig` and offer suggestions to update it when appropriate. If something is ambiguous because it's unspecified, ask.
- When the user asks clarifying questions, respond with answers only; do NOT make any code changes.

# General validation
Validation must be aggregated/deferred. Do NOT just report the first invalid input. Users should receive information about everything invalid.

# URI validation
When parsing URIs, the entire query string should be validated while tracking positional information so more informative messages can be provided.
- First, the schema should be validated.
  - Is the key a valid command?
  - Is the value valid for its command?
- Next, we should simulate executing valid-schema'd commands sequentially. For example:
  - `open` should ensure the provided path exists.
  - `select` should ensure the provided ranges exist.
- If there are no validation errors, execute all the commands
- If there are validation errors, present a combined report of all of them (schema & simulation).

# Tests
- All commands need unit tests for parsing, encoding, and validation.
- Validation tests likely will need mocking of the file system and file contents.
  - Can I `open` this file? If the mock says it exists, yes.
  - Can I `select` these characters on this line in the current text editor? If the mock they exist, yes.
- Tests code should be DRY: make helper methods and classes.
- Unit tests should live next to the files being tested to make coverage easy to determine.
  - `OpenCommand{.spec}.ts`
  - `OpenParameters{.spec}.ts`
- If a need arises to have an integration test, ask how we should handle it.

# Tool and Terminal Usage
- Always prefer built-in tools (`list_dir`, `read_file`, `grep_search`, `file_search`) over terminal commands for inspection tasks.
- Never use terminal commands to inspect files when built-in tools will work.
- For terminal operations, prefer in order:
  1. Bun for package scripts (`bun run build`, `bun test`), installation (`bun install`), and bundling
  2. PowerShell for git, file operations, and system commands