import { logger } from '../config/logger'
import ApiError from '../utils/ApiError'
import { Request, Response, NextFunction } from 'express'

export const errorMiddleware = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof ApiError) {
        logger.warn(`ApiError: ${err.message}`, { statusCode: err.statusCode, stack: err.stack })
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        })
    }

    if (err instanceof Error) {
        logger.error(`Unhandled error: ${err.message}`, { stack: err.stack })
    } else {
        logger.error('Unhandled non-error thrown')
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    })
}