import { Selection } from './Selection';

export class SelectParameters {
  readonly selections: Selection[];
  readonly addToExisting: boolean;

  constructor(init: { selections: Selection[]; addToExisting?: boolean }) {
    if (init.selections.length === 0) {
      throw new Error('Selections array cannot be empty');
    }

    this.selections = init.selections;
    this.addToExisting = init.addToExisting ?? false;
  }

  toQueryParams(): Record<string, string> {
    const encoded = this.selections.map(s => this.encodeSelection(s)).join(';');
    const prefix = this.addToExisting ? '+' : '';
    return { select: prefix + encoded };
  }

  private encodeSelection(selection: Selection): string {
    if (selection.isCursor) {
      return this.encodeCursor(selection);
    }
    if (selection.isSameLine) {
      return this.encodeSameLineSelection(selection);
    }
    return this.encodeCrossLineSelection(selection);
  }

  private encodeCursor(selection: Selection): string {
    return this.encodePosition(selection.anchorLine, selection.anchorCharacter);
  }

  private encodeSameLineSelection(selection: Selection): string {
    const linePrefix = `${selection.anchorLine}:`;
    return `${linePrefix}${selection.anchorCharacter}-${selection.activeCharacter}`;
  }

  private encodeCrossLineSelection(selection: Selection): string {
    const anchor = this.encodePosition(selection.anchorLine, selection.anchorCharacter);
    const active = this.encodePosition(selection.activeLine, selection.activeCharacter);
    return `${anchor}-${active}`;
  }

  private encodePosition(line: number, character: number): string {
    return character === 1 ? `${line}` : `${line}:${character}`;
  }
}
