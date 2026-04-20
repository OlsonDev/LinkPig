export class Selection {
  readonly anchorLine: number;
  readonly anchorCharacter: number;
  readonly activeLine: number;
  readonly activeCharacter: number;

  constructor(init: {
    anchorLine: number;
    anchorCharacter: number;
    activeLine: number;
    activeCharacter: number;
  }) {
    this.validatePositiveNumber(init.anchorLine, 'anchorLine');
    this.validatePositiveNumber(init.anchorCharacter, 'anchorCharacter');
    this.validatePositiveNumber(init.activeLine, 'activeLine');
    this.validatePositiveNumber(init.activeCharacter, 'activeCharacter');

    this.anchorLine = init.anchorLine;
    this.anchorCharacter = init.anchorCharacter;
    this.activeLine = init.activeLine;
    this.activeCharacter = init.activeCharacter;
  }

  private validatePositiveNumber(value: number, name: string): void {
    if (value < 1) {
      throw new Error(`${name} must be >= 1, got ${value}`);
    }
  }

  static fromLine(line: number): Selection {
    return new Selection({
      anchorLine: line,
      anchorCharacter: 1,
      activeLine: line,
      activeCharacter: 1
    });
  }

  static fromPosition(line: number, character: number): Selection {
    return new Selection({
      anchorLine: line,
      anchorCharacter: character,
      activeLine: line,
      activeCharacter: character
    });
  }

  static fromLineRange(anchorLine: number, activeLine: number): Selection {
    return new Selection({
      anchorLine,
      anchorCharacter: 1,
      activeLine,
      activeCharacter: 1
    });
  }

  static fromCharacterRange(line: number, anchorCharacter: number, activeCharacter: number): Selection {
    return new Selection({
      anchorLine: line,
      anchorCharacter,
      activeLine: line,
      activeCharacter
    });
  }

  get isCursor(): boolean {
    return this.anchorLine === this.activeLine &&
           this.anchorCharacter === this.activeCharacter;
  }

  get isSameLine(): boolean {
    return this.anchorLine === this.activeLine;
  }
}
