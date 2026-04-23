---
description: Review code style and conventions
argument-hint: Expects code references and guidelines.
tools: [read/readFile, search/codebase]
instructions: ['Code-Review']
---

Review code for style consistency:

- Naming conventions
- File organization (one type per file)
- OOP/functional paradigms over procedural
- Adherence to .editorconfig
- Consider whether short arrays are likely to grow over time. If so, a `// Diff friendly` comment inside the array keeps Prettier from collapsing it to one line, so future additions only touch a single diff line. Use judgment — not every array needs this.
- Prose in user-facing strings should use proper typographic characters as defined in `docs/Chars.md` (smart quotes, smart apostrophes, `≥`/`≤`, etc.). Use the actual characters, never escape sequences like `\u201c`. Excluded:
  - `plans/`
  - `.github/agents/`
  - `.github/instructions/`
