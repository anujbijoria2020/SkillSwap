import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import ApiError from './ApiError';

export type JwtPayload = {
    userId: string;
    email: string;
};

const generateAccessToken = (payload: JwtPayload): string => {
    const secret: Secret = env.JWT_ACCESS_SECRET;
    const expiresIn = env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'];
    return jwt.sign(payload, secret, { expiresIn });
};

const generateRefreshToken  = (payload:JwtPayload):string=>{
    const secret:Secret = env.JWT_REFRESH_SECRET;
    const expiresIn = env.JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'];
    return jwt.sign(payload, secret, { expiresIn });
}

const verifyAccessToken = (token: string): JwtPayload => {
    const secret: Secret = env.JWT_ACCESS_SECRET;
    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
        throw new ApiError(401, 'Invalid token');
    }
};

const verifyRefreshToken = (token: string): JwtPayload => {
    const secret: Secret = env.JWT_REFRESH_SECRET;
    try{
        return jwt.verify(token, secret) as JwtPayload;
    }catch(error){
        throw new ApiError(401, 'Invalid token');
    }
}

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };