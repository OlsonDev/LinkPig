import { OpenParameters, Selection, SelectParameters } from '../core';

export class LinkPigUriBuilder {
  private commands: Array<{ key: string; value: string }> = [];
  private readonly scheme = 'vscode';
  private readonly authority = 'olsondev.link-pig';

  open(path: string): this;
  open(params: OpenParameters): this;
  open(pathOrParams: string | OpenParameters): this {
    const params = typeof pathOrParams === 'string' 
      ? new OpenParameters({ relativePath: pathOrParams }) 
      : pathOrParams;
    
    const queryParams = params.toQueryParams();
    for (const [key, value] of Object.entries(queryParams)) {
      this.commands.push({ key, value });
    }
    return this;
  }

  select(parameters: SelectParameters): this;
  select(selections: Selection[]): this;
  select(anchorLine: number): this;
  select(anchorLine: number, anchorCharacter: number): this;
  select(anchorLine: number, anchorCharacter: number, activeCharacter: number): this;
  select(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number): this;
  select(
    first: SelectParameters | Selection[] | number,
    second?: number,
    third?: number,
    fourth?: number
  ): this {
    const selections = this.resolveSelections(first, second, third, fourth);
    return this.applySelect(selections, false);
  }

  selectAdd(parameters: SelectParameters): this;
  selectAdd(selections: Selection[]): this;
  selectAdd(anchorLine: number): this;
  selectAdd(anchorLine: number, anchorCharacter: number): this;
  selectAdd(anchorLine: number, anchorCharacter: number, activeCharacter: number): this;
  selectAdd(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number): this;
  selectAdd(
    first: SelectParameters | Selection[] | number,
    second?: number,
    third?: number,
    fourth?: number
  ): this {
    const selections = this.resolveSelections(first, second, third, fourth);
    return this.applySelect(selections, true);
  }

  private resolveSelections(
    first: SelectParameters | Selection[] | number,
    second?: number,
    third?: number,
    fourth?: number
  ): Selection[] {
    if (first instanceof SelectParameters) {
      return first.selections;
    }
    if (Array.isArray(first)) {
      return first;
    }
    return [this.createSelectionFromArgs(first, second, third, fourth)];
  }

  private createSelectionFromArgs(
    anchorLine: number,
    anchorCharacter?: number,
    thirdArg?: number,
    fourthArg?: number
  ): Selection {
    if (anchorCharacter === undefined) {
      return Selection.fromLine(anchorLine);
    }
    if (thirdArg === undefined) {
      return Selection.fromPosition(anchorLine, anchorCharacter);
    }
    if (fourthArg === undefined) {
      return Selection.fromCharacterRange(anchorLine, anchorCharacter, thirdArg);
    }
    return new Selection({
      anchorLine,
      anchorCharacter,
      activeLine: thirdArg,
      activeCharacter: fourthArg
    });
  }

  private applySelect(selections: Selection[], addToExisting: boolean): this {
    const params = new SelectParameters({ selections, addToExisting });
    const queryParams = params.toQueryParams();
    for (const [key, value] of Object.entries(queryParams)) {
      this.commands.push({ key, value });
    }
    return this;
  }

  build(): string {
    const encodeQueryValue = (value: string): string => {
      return value.replace(/[%&#\s]/g, (char) => {
        return '%' + char.charCodeAt(0).toString(16).toUpperCase();
      });
    };

    const queryString = this.commands
      .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeQueryValue(value)}`)
      .join('&');
    
    return `${this.scheme}://${this.authority}?${queryString}`;
  }

  static create(): LinkPigUriBuilder {
    return new LinkPigUriBuilder();
  }
}
