import { NextFunction,Request,Response } from "express"
import { addSkillsOffered, addSkillsWanted, deleteMe, getAllUsers, getMe, getMySkills, getUserById, removeSkillsOffered, removeSkillsWanted, updateMe } from "./user.services"
import { getReviewsForUser } from "../reviews/reviews.services"

export const getMeController = async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const userId = req.user?.userId;
    const user = await getMe(userId!);
    res.status(200).json({
        success:true,
                message: "User fetched successfully",
        data:user
    })
  } catch (error) {
    next(error)
  }
}

export const updateMeController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const data = req.body;
        const updatedUser = await updateMe(userId!,data);
        res.status(200).json({
            success:true,
            message: "User updated successfully",
            data:updatedUser
        })
    } catch (error) {
        next(error)
    }
}

export const deleteMeController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        await deleteMe(userId!);
        res.status(200).json({
            success:true,
            message: "User deleted successfully",
            data:null
        })
    } catch (error) {
        next(error)
    }
}

export const getUserByIdController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.params.id as string;
        const user = await getUserById(userId);
        res.status(200).json({
            success:true,
            message: "User fetched successfully",
            data:user
        });
    } catch (error) {
        next(error)
    }
}

export const getAllUsersController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const users = await getAllUsers();
        res.status(200).json({
            success:true,
            message: "Users fetched successfully",
            data:users
        });
    } catch (error) {
        next(error)
    }
}


export const addSkillsOfferedController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const data = req.body;
        const updatedSkills = await addSkillsOffered(userId!,data);
        res.status(201).json({
            success:true,
            message: "Offered skills added successfully",
            data:updatedSkills
        });
    } catch (error) {
        next(error)
    }
}

export const addSkillsWantedController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const data = req.body;
        const updatedSkills = await addSkillsWanted(userId!,data);
        res.status(201).json({
            success:true,
            message: "Wanted skills added successfully",
            data:updatedSkills
        });
    } catch (error) {
        next(error)
    }   
}

export const removeSkillsOfferedController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const skillId = req.params.skillId as string;
        await removeSkillsOffered(skillId,userId!);
        res.status(200).json({
            success:true,
            message:"Offered skill removed successfully",
            data:null
        });
    } catch (error) {
        next(error)
    }
}

export const removeSkillsWantedController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const skillId = req.params.skillId as string;
        await removeSkillsWanted(skillId,userId!);
        res.status(200).json({
            success:true,
            message:"Wanted skill removed successfully",
            data:null
        });
    } catch (error) {
        next(error)
    }
}

export const getMySkillsController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const skills = await getMySkills(userId!);
        res.status(200).json({
            success:true,
            message: "Skills fetched successfully",
            data:skills
        });
    } catch (error) {
        next(error)
    }
}

export const getMyReviewsController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const reviews = await getReviewsForUser(userId!);
        res.status(200).json({
            success:true,
            message: "Reviews fetched successfully",
            data:reviews
        });
    } catch (error) {
        next(error)
    }
}

export const getUserReviewsController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.params.id as string;
        const reviews = await getReviewsForUser(userId);
        res.status(200).json({
            success:true,
            message: "Reviews fetched successfully",
            data:reviews
        });
    } catch (error) {
        next(error)
    }
}
