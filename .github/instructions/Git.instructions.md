---
description: Load when making git commits
instructions: ['Guidelines', 'Detours']
---

# Git conventions

## Commit message format

`{emoji} {message}.` or `{emoji}{emoji} {message}.`

- Capitalize the first word
- Run-on sentence
- End with a period
- Use commas within a logical change
- Use semi-colons between changes
- Two emojis if two main themes
- Wrap code identifiers in backticks: `devDependencies`, `foo()`
- Reference agents as `@AgentName`: `@Reviewer-Style`
- Reference instructions as `§Name`: `§Git`
- Use full commands: `npm audit fix` not "audit fix"

```
✅ Added SelectCommand tests; updated OpenCommand tests.
♻️⚡ Refactored foo for performance.
🎨 Formatting; whitespace.
```

## Atomic commits

See §Detours for keeping diffs reviewable (separate renames, boyscout cleanups).

## Gitmoji reference

- ✨ New feature
- 🚧 Work in progress
- 🧪 Add failing test
- ✅ Adding/updating tests
- ♻️ Refactor
- 🚚 Rename symbol, move file
- ⚡️ Performance improvement
- 🐛 Bug fix
- 🩹 Simple fix for non-critical issue
- ⬆️⬇️ Upgrade/downgrade dependencies
- 📝 Documentation
- 🎨 Style, formatting, whitespace
- 💄 UI/style updates
- 🏗️ Architectural changes
- 🔥 Remove code/files
- ⚰️ Remove dead code
- 🗑️ Deprecate code
- 🚀 Deploy / release
- 🔧 Configuration files
- 🦖 Add backwards compatibility

## Unofficial emojis

- 🛸 Extracting code to method/file
- 🦾 Update AI-related code (agents, instructions, etc.)
