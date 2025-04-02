import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _: ArgumentMetadata): any {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Validation failed');
    }
  }
}
