import { ExecutionContext } from './ExecutionContext';
import { ValidationResult } from './ValidationResult';

export abstract class Command<TParams = any> {
  constructor(
    public readonly params: TParams,
    public readonly paramKey: string,
    public readonly position: number
  ) {}

  abstract validate(context: ExecutionContext): Promise<ValidationResult>;
  abstract execute(context: ExecutionContext): Promise<void>;

  static parse(_value: string, _position: number): Command {
    throw new Error('parse must be implemented by subclass');
  }
}
