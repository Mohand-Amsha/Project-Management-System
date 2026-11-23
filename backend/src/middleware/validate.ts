import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = {
        body: req.body ?? {},
        query: req.query ?? {},
        params: req.params ?? {},
      };

      schema.parse(dataToValidate);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");

        const error = new Error(message) as Error & { statusCode: number };
        error.statusCode = 400;
        next(error);
        return;
      }
      next(err);
    }
  };