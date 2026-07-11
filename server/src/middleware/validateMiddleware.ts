import type { Request, Response, NextFunction } from "express"
import type { AnyZodObject } from "zod"

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      // Assign parsed data back only if defined in schema
      if (parsed.body !== undefined) req.body = parsed.body
      if (parsed.query !== undefined) req.query = parsed.query
      if (parsed.params !== undefined) req.params = parsed.params
      next()
    } catch (error) {
      next(error)
    }
  }
}
