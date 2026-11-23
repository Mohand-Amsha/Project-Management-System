import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

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

        // AppError so the error handler returns 400 with this message (not a 500)
        next(new AppError(message, 400));
        return;
      }
      next(err);
    }
  };
