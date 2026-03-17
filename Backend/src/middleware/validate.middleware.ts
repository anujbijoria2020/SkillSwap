import { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'
import ApiError from '../utils/ApiError'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if(!result.success){
     throw new ApiError(400, JSON.stringify(result.error));
    }
    req.body = result.data;
    next();
}
}
