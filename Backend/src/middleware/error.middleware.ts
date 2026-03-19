import { logger } from "../config/logger";
import ApiError from "../utils/ApiError";
import {Request, Response, NextFunction} from "express";

export const errorMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack })
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}