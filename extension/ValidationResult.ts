export interface ValidationError {
  param: string;
  position: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
