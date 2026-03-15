import { Request, Response, NextFunction } from 'express'
import { login, register } from "./auth.service";
import { LoginInput, RegisterInput } from "./auth.validation";


export const registerController = async(req:Request,res:Response,next:NextFunction)=>{
    try {
           const data= req.body as RegisterInput;
           const result = await register(data);
           res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
           });
        } catch (error) {
            next(error);
        }
}

export const loginController = async(req:Request,res:Response,next:NextFunction)=>{
    try {
            const data = req.body as LoginInput;
            const result = await login(data);
            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
}