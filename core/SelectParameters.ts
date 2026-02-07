export class SelectParameters {
  readonly line: number;
  readonly column?: number;

  constructor(init: { line: number; column?: number }) {
    if (init.line < 1) {
      throw new Error('Line must be >= 1');
    }
    if (init.column !== undefined && init.column < 1) {
      throw new Error('Column must be >= 1');
    }
    
    this.line = init.line;
    this.column = init.column;
  }

  static fromLineColumn(line: number, column?: number): SelectParameters {
    return new SelectParameters({ line, column });
  }

  toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {
      select: this.column !== undefined ? `${this.line}:${this.column}` : `${this.line}`
    };
    return params;
  }
}
