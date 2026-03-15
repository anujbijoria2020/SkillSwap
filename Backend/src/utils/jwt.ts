import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import ApiError from './ApiError';

type JwtPayload = {
    userId: string;
    email: string;
};

const generateToken = (payload: JwtPayload): string => {
    const secret: Secret = env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const expiresIn = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];

    return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token: string): JwtPayload => {
    const secret: Secret = env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
        throw new ApiError(401, 'Invalid token');
    }
};

export { generateToken, verifyToken };