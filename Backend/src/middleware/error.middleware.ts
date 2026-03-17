import ApiError from "../utils/ApiError";
import {Request, Response, NextFunction} from "express";

export const errorMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
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