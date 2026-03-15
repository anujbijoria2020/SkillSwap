import ApiError from "../../utils/ApiError";
import { prisma } from "../../config/prisma";
import { RegisterInput,LoginInput } from "./auth.validation";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";

export const register = async(input:RegisterInput)=>{
    const {name,email, password} = input;
    const existingUser = await prisma.user.findUnique({where:{email}});
    if(existingUser){
        throw new ApiError(409, "User already exists");
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    const {password:_,...userWithoutPassword}  = user;

    const token = generateToken({userId: user.id, email: user.email});

    return {user:userWithoutPassword,token};
};

export const login = async(input:LoginInput)=>{
    const {email, password} = input;
    const user = await prisma.user.findUnique({where:{email}});
    if(!user){
        throw new ApiError(401, "User not found");
    }
    const isMatch = await comparePassword(password, user.password);
    if(!isMatch){
        throw new ApiError(401, "Invalid credentials");
    }
    const token = generateToken({userId: user.id, email: user.email});
    const {password:_,...userWithoutPassword}  = user;
    return {user:userWithoutPassword, token};
};
