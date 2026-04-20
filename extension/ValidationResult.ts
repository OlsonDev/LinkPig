export class ValidationError {
  readonly param: string;
  readonly position: number;
  readonly message: string;

  constructor(param: string, position: number, message: string) {
    this.param = param;
    this.position = position;
    this.message = message;
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
