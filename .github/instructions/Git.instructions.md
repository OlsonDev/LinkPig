---
description: Load when making git commits
---
# Git conventions

## Commit message format
`{emoji} {message}` or `{emoji}{emoji} {message}`

Use two emojis when there's more than one main theme. Messages are run-on sentences (no periods). Use commas within a logical change, semi-colons between logical changes:
```
✅ added validation tests for SelectCommand: range bounds, negative values
♻️ refactored foo-test: extracted methods, optimized looping to be a single pass; updated dependencies: `bar` because specific bug fixed, `qux` because security
♻️⚡ refactored foo for performance gains
```

## Compiling code
Commits should compile so tooling (linters, test runners) can verify everything else still works. Scaffolding should use `throwNotImplemented()` rather than leaving code incomplete.

## Atomic commits
Keep commits focused so diffs stay reviewable:

**Separate moves/renames from logic changes.** A rename-only commit has a huge diff but no logical change—easy to skim. Mixing rename + logic change makes review painful.

**Boyscout improvements get their own commits.** When you spot a cleanup opportunity (dead code, naming, minor refactor), do it—but commit it separately from the main feature work. This keeps the feature commits focused and makes the boyscout work easy to review or revert independently.

Order commits logically: boyscout cleanups and renames often come *before* the feature commit that benefits from them.

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
These extend gitmoji for our team's workflow:
- 🛸 Extracting code to method/file
- 🦾 Update AI-related code
- 🤖 Work done by AI agent
