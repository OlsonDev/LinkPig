export function throwNotImplemented(intendedDesign?: string): never {
  const message = intendedDesign
    ? `Not implemented: ${intendedDesign}`
    : 'Not implemented';
  throw new Error(message);
}
