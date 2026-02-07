import { OpenParameters, SelectParameters } from '../core';

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

  select(line: number, column?: number): this;
  select(params: SelectParameters): this;
  select(lineOrParams: number | SelectParameters, column?: number): this {
    const params = typeof lineOrParams === 'number' 
      ? new SelectParameters({ line: lineOrParams, column }) 
      : lineOrParams;
    
    const queryParams = params.toQueryParams();
    for (const [key, value] of Object.entries(queryParams)) {
      this.commands.push({ key, value });
    }
    return this;
  }

  build(): string {
    const queryString = this.commands
      .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${this.scheme}://${this.authority}?${queryString}`;
  }

  static create(): LinkPigUriBuilder {
    return new LinkPigUriBuilder();
  }
}
