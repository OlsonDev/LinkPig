---
description: Load when making git commits
instructions: ['Detours']
---
# Git conventions

## Commit message format
`{emoji} {message}` or `{emoji}{emoji} {message}`

Run-on sentences (no periods). Commas within a logical change, semi-colons between changes:
```
✅ added SelectCommand validation tests
♻️⚡ refactored foo for performance
```

## Compiling code
Commits should compile. Scaffolding uses `throwNotImplemented()`.

## Atomic commits
See Detours.instructions.md for keeping diffs reviewable (separate renames, boyscout cleanups).

## Gitmoji reference
- ✨ New feature
- 🚧 Work in progress / scaffolding
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
- 🦾 Update AI-related code
- 🤖 Work done by AI agent
