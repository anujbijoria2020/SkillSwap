import { NextFunction,Request,Response } from "express"
import { addSkillsOffered, addSkillsWanted, deleteMe, getAllUsers, getMe, getMySkills, getUserById, removeSkillsOffered, removeSkillsWanted, updateMe } from "./user.services"

export const getMeController = async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const userId = req.user?.userId;
    const user = await getMe(userId!);
    res.status(200).json({
        success:true,
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
            data:updatedUser
        })
    } catch (error) {
        next(error)
    }
}

export const deleteMeController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user?.userId;
        const result = await deleteMe(userId!);
        res.status(200).json({
            success:true,
            data:result
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
        res.status(200).json({
            success:true,
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
        res.status(200).json({
            success:true,
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
            message:"Skill removed successfully"
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
            message:"Skill removed successfully"
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
            data:skills
        });
    } catch (error) {
        next(error)
    }
}
