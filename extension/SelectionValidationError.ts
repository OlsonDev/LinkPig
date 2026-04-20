import { ValidationError } from './ValidationResult';

export class SelectionValidationError extends ValidationError {
  readonly selectionIndex: number;

  constructor(param: string, position: number, message: string, selectionIndex: number) {
    super(param, position, message);
    this.selectionIndex = selectionIndex;
  }
}
