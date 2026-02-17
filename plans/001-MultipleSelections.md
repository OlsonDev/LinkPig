# VS Code extension goals:
- We need to support multiple cursor positions/selections (both the anchor and active positions).
- We need to support adding to the existing selection and replacing the existing selection.
- We need to make the user experience delightful by showing the most relevant portion of a multi-selection.

# VS Code supports:
- Multiple cursor positions/selections with delineation between the anchor position and active position.
- `TextEditor.visibleRanges`, which could give us an approximation of how many lines of code can be visible at any one time.
- `TextEditor.revealRange()` to show ranges of a text editor.

# `SelectParameters`
- This becomes two fields: `addToExisting` and `selections[]`.

# `Selection`
- Add a new `class` in `core/Selection.ts` that encompasses these 4 `number` fields:
    - `anchorLine`
    - `anchorCharacter`
    - `activeLine`
    - `activeCharacter`
- Export from `core/index.ts`.

# Builder overloads
- All of these should be supported for convenience:
```typescript
.select(parameters: SelectParameters): this
// These all construct `SelectParameters` with `addToExisting: false`:
.select(selections: Selection[]): this
// This is interpreted as anchorCharacter = 1, activeLine = anchorLine, and activeCharacter = anchorCharacter
.select(anchorLine): this
// This is interpreted as activeLine = anchorLine and activeCharacter = anchorCharacter
.select(anchorLine, anchorCharacter): this
// This is interpreted as activeLine = anchorLine
.select(anchorLine, anchorCharacter, activeCharacter): this
.select(anchorLine, anchorCharacter, activeLine, activeCharacter): this

// Same signatures as above EXCEPT the overload that takes in SelectParameters.
// These all set `addToExisting: true`.
.selectAdd(...)
```

# Reminder
An empty array of selections is invalid and shouldn't be executed; the validation phase mentioned in `AGENTS.md` should catch it. This should be a validation error (not a thrown exception) to remain consistent with aggregated validation.

# Validation enhancements
- Introduce `ValidationErrorCollection` to encapsulate error aggregation:
  - Replaces raw `ValidationError[]` throughout the codebase
  - Provides methods for adding errors, checking validity, and formatting output
  - Enables polymorphic error types via a common base
- Subclass `ValidationError` for context-specific errors:
  - `SelectionValidationError extends ValidationError` adds `selectionIndex: number`
  - Future commands can define their own subclasses as needed
- Error messages leverage subclass data, e.g., `SelectionValidationError` produces "Selection 2: line out of range".

# URI encoding
- The `SelectCommand` needs to support multiple selections in a single value.
- `;` delimits each selection
- `-` is overloaded:
    - When `anchorLine` != `activeLine`, it delimits `anchor` and `active` positions.
    - When `anchorLine` == `activeLine`, it delimits `anchorCharacter` and `activeCharacter`.
- `:` delimits line number and character number
    - If the character position would be `:1`, it may be omitted.
    - However, if `anchorLine` == `activeLine`, `anchorCharacter` != `activeCharacter`, it may not be omitted for either.
- If `active` position isn't provided, it's assumed to be == `anchor` position.

## Parsing disambiguation
The `-` overloading is unambiguous because the count of `:` delimiters determines interpretation:
- `1:4-20` — one `:`, so `-20` is a column on the same line (line 1, col 4 to col 20)
- `3:5-2:6` — two `:`, so `-` splits two line:col pairs (line 3 col 5 to line 2 col 6)

For example: `&select=1:4-20;3:5-2:6` should be interpreted as _replace_ the selection with two selections:
- Line 1, column 4 to 20
- Line 3, column 5 to line 2, column 6 (active before anchor)

To set `addToExisting: true`, prefix with `+`, e.g. `&select=+7;8` would add cursors to lines 7 and 8 at the first character.

# Revealing selection ranges
- We should start from the last selection and go backwards to simulate what the user did who's sharing the link.
- We should center whatever we can make visible.
- We should shift toward the direction of the first selection we can't make visible.
- We should attempt to have at least a 2-line padding.
    - For instance, if we can show 45 lines and are given `?select=98-100;150-160`, the difference between the top and bottom would be 62 lines. Since the selection `150-160` is last we should set the viewport to lines 117 to 162 to get as close to the `98-100` selection as possible, but leaving a 2 line padding after `160`.
- As we're going backwards, if we can show a partial selection, we will allow a 1-line padding because it's more useful to show the extra selection than to get the extra padding.
- If not, we take what we can fit and center it.
- For now, we will assume there aren't multiple disjoint ranges (split editors). We will use the first `visibleRanges` value.
- If the 2-line padding extends beyond document bounds, we will clamp it to document bounds for now.

# Files to create
- `core/Selection.ts` — New class with `anchorLine`, `anchorCharacter`, `activeLine`, `activeCharacter`
- `core/Selection.spec.ts` — Tests for the new class
- `core/SelectParameters.spec.ts` — Encoding tests
- `extension/commands/SelectCommand.spec.ts` — Parsing and validation tests

# Files to modify
- `core/SelectParameters.ts` — Change from single `line`/`column` to `addToExisting: boolean` + `selections: Selection[]`
- `core/index.ts` — Export `Selection`
- `extension/commands/SelectCommand.ts` — New parser, multi-selection validation/execution, reveal algorithm
- `builder/LinkPigUriBuilder.ts` — Add overloads + `selectAdd()` methods

# Files to create (validation)
- `extension/ValidationErrorCollection.ts` — Collection class encapsulating error aggregation
- `extension/SelectionValidationError.ts` — Subclass of `ValidationError` with `selectionIndex`

# Files to refactor (validation)
- `extension/ValidationResult.ts` — Update to use `ValidationErrorCollection`; `ValidationError` becomes base class
- `extension/LinkPigUriHandler.ts` — Use `ValidationErrorCollection` instead of raw array