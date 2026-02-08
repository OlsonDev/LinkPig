# VS Code extension goals:
- We need to support multiple cursor positions/selections (both the anchor and active positions).
- We need to support adding to the existing selection and replacing the existing selection.
- We need to make the user experience delightful by showing the most relevant portion of a multi-selection.

# VS Code supports:
- Multiple cursor positions/selections with delineation between the anchor position and active position.
- `TextEditor.visibleRanges`, which could give us an approximation of how many lines of code can be visible at any one time.
- `TextEditor.revealRange()` to show ranges of a text editor.

# `SelectionParameters`
- This becomes two fields: `addToExisting` and `selections[]`.

# Builder overloads
- All of these should be supported for convenience:
```typescript
.select(parameters: SelectionParameters): this
// These all construct `SelectionParameters` with `addToExisting: false`:
.select(selections: Selection[]): this
// This is interpreted as anchorCharacter = 1, activeLine = anchorLine, and activeCharacter = anchorCharacter
.select(anchorLine: number): this
// This is interpreted as activeLine = anchorLine and activeCharacter = anchorCharacter
.select(anchorLine: number, anchorCharacter: number): this
// This is interpreted as activeLine = anchorLine
.select(anchorLine: number, anchorCharacter: number, anchorCharacter: number): this
.select(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number): this

// Same signatures as above EXCEPT the overload that takes in SelectionParameters.
// These all set `addToExisting: true`.
.selectAdd(...)
```

# URI encoding
- The `SelectCommand` needs to support multiple selections in a single value.
- `:` will delimit line number and character number
- `;` will delimit each selection
- `-` will delimit the anchor and active positions
- If parts are missing, the "Builder overloads" above hints at how it should work.

For example: `&select=1:4-20;3:5-2:6` should be interpreted as _replace_ the selection with two selections:
- Line 1, column 4 to 20
- Line 3, column 5 to line 2, column 6 (active before anchor)

To set `addToExisting: true`, prefix with `+`, e.g. `&select=+7;8` would add cursors to lines 7 and 8 at the first character.

We should also support something like `&select=1-10` to imply selecting line 1, column 1 to line 10, column 1. That is, `:1` is redundant on its own.

# Revealing selection ranges
- We should start from the last selection and go backwards to simulate what the user did who's sharing the link.
- We should center whatever we can make visible.
- We should shift toward the direction of the first selection we can't make visible.
- We should attempt to have at least a 2-line padding.
    - For instance, if we can show 45 lines and are given `?select=98-100;150-160`, the difference between the top and bottom would be 62 lines. Since the selection `150-160` is last we should set the viewport to lines 117 to 162 to get as close to the `98-100` selection as possible, but leaving a 2 line padding after `160`.
- As we're going backwards, if we can show a partial selection, we will allow a 1-line padding because it's more useful to show the extra selection than to get the extra padding.
- If not, we take what we can fit and center it.