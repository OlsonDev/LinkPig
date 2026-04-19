---
description: Load when writing or reviewing code.
---
# Code guidelines
- Keep documentation additions/edits to a minimum as the project hasn't stabilized.
- Do NOT worry about backwards compatibility/breaking changes/semver (semantic versioning) yet.
- Keep comments in the code to a minimum; prefer creating new named symbols (variables, methods/functions, types/classes) to express how/why things work the way they do.
- Prefer object-oriented and functional paradigms over procedural.
- Only put one type per file; this will keep git diffs clean and make it easier to see what has unit tests (see below).
- Prefer passing objects to methods over primitive types. However, we should also embrace making builder methods to reduce boilerplate.
- Look for opportunities to follow the DRY (Don't Repeat Yourself) principle.
- Follow the `.editorconfig`. If something is ambiguous because it's unspecified, ask.