export class OpenParameters {
  readonly relativePath: string;

  constructor(init: { relativePath: string }) {
    this.relativePath = init.relativePath;
  }

  static fromAbsolutePath(absolutePath: string, workspaceRoot: string): OpenParameters {
    if (!absolutePath.startsWith(workspaceRoot)) {
      throw new Error(`Path ${absolutePath} is not within workspace ${workspaceRoot}`);
    }
    const relativePath = absolutePath.slice(workspaceRoot.length).replaceAll(/^[\\/]+/g, '');
    return new OpenParameters({ relativePath });
  }

  toQueryParams(): Record<string, string> {
    return {
      open: this.relativePath.replaceAll('\\', '/')
    };
  }
}
