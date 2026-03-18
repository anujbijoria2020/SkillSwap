import ApiError from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";
import { Request,Response,NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided')
        }
        const token = authHeader.split(' ')[1];
        const payload = verifyAccessToken(token);
        req.user = { userId: payload.userId, email: payload.email };
        next();
    } catch (error) {
        next(error);
    }
}