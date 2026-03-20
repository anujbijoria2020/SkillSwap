import { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'
import ApiError from '../utils/ApiError'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const firstIssue = result.error.issues[0]
      const field = firstIssue?.path?.join('.')
      const message = field
        ? `Validation error: ${field} - ${firstIssue.message}`
        : `Validation error: ${firstIssue?.message ?? 'Invalid request body'}`

      return next(new ApiError(400, message))
    }

    req.body = result.data
    return next()
  }
}
