import { ZodSchema } from "zod";

export class Validator {
  static parse<T>(schema: ZodSchema<T>, payload: unknown) {
    return schema.parse(payload);
  }
}
