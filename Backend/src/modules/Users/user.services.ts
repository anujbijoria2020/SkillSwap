import { prisma } from "../../config/prisma";
import ApiError from "../../utils/ApiError";
import { SkillsInput, updateUserInput } from "./user.validation";


export const getMe = async(userId:string)=>{
   const user = await prisma.user.findUnique({where:{id:userId}})
    if(!user){
        throw new ApiError(404,"User not found");
    }
    const {password,...withoutPassword} = user;
    return withoutPassword;
}

export const updateMe = async(userId:string,data:updateUserInput)=>{
    const updatedUser = await prisma.user.update({
        where:{id:userId},
        data
    });
    const {password,...withoutPassword} = updatedUser;
    return withoutPassword;
}

export const deleteMe = async(userId:string)=>{
    const user  = await prisma.user.findUnique({where:{id:userId}});
    if(!user){
        throw new ApiError(404,"User not found");
    }
    await prisma.user.delete({where:{id:userId}});
    return {message:"User deleted successfully"};
}

export const getUserById = async(userId:string)=>{
    const user = await prisma.user.findUnique({where:{id:userId}});
    if(!user){
        throw new ApiError(404,"User not found");
    }
    const {password,...withoutPassword} = user;
    return withoutPassword;
}

export const getAllUsers = async()=>{
    const users = await prisma.user.findMany();
    return users.map(user=>{
        const {password,...withoutPassword} = user;
        return withoutPassword;
    });
}


// addSkillsOffered(userId: string, data: SkillsInput)
// → prisma.skillOffered.createMany with data.skills.map(name => ({ name, userId }))
// → return updated skills list: prisma.skillOffered.findMany({ where: { userId } })

export const addSkillsOffered = async(userId:string,data:SkillsInput)=>{
    const createData = data.skills.map(name=>({name,userId}));
    await prisma.skillOffered.createMany({data:createData});
    const updatedSkills = await prisma.skillOffered.findMany({where:{userId}});
    return updatedSkills;
}

// addSkillsWanted(userId: string, data: SkillsInput)
// → prisma.skillWanted.createMany with data.skills.map(name => ({ name, userId }))
// → return updated skills list: prisma.skillWanted.findMany({ where: { userId } })

export const addSkillsWanted = async(userId:string,data:SkillsInput)=>{
    const createData = data.skills.map(name=>({name,userId}));
    await prisma.skillWanted.createMany({data:createData});
    const updatedSkills = await prisma.skillWanted.findMany({where:{userId}});
    return updatedSkills;
}

// removeSkillOffered(skillId: string, userId: string)
// → find skill: prisma.skillOffered.findUnique({ where: { id: skillId } })
// → if not found → throw ApiError(404, 'Skill not found')
// → if skill.userId !== userId → throw ApiError(403, 'Not authorized')
// → prisma.skillOffered.delete({ where: { id: skillId } })

export const removeSkillsOffered = async(skillId:string,userId:string)=>{
    const skill = await prisma.skillOffered.findUnique({where:{id:skillId}});
    if(!skill){
        throw new ApiError(404,"Skill not found");
    }
    if(skill.userId !== userId){
        throw new ApiError(403,"Not authorized");
    }
    await prisma.skillOffered.delete({where:{id:skillId}});
}

// removeSkillWanted(skillId: string, userId: string)
// → same as removeSkillOffered but for skillWanted model

export const removeSkillsWanted = async(skillId:string,userId:string)=>{
    const skill = await prisma.skillWanted.findUnique({where:{id:skillId}});
    if(!skill){
        throw new ApiError(404,"Skill not found");
    }
    if(skill.userId !== userId){
        throw new ApiError(403,"Not authorized");
    }
    await prisma.skillWanted.delete({where:{id:skillId}});
}

// getMySkills(userId: string)
// → prisma.user.findUnique({
//      where: { id: userId },
//      include: { skillsOffered: true, skillsWanted: true }
//    })
// → if not found → throw ApiError(404, 'User not found')
// → return { skillsOffered, skillsWanted }

export const getMySkills = async(userId:string)=>{
    const user = await prisma.user.findUnique({
        where:{id:userId},
        include:{skillsOffered:true,skillsWanted:true}
    });
    if(!user){
        throw new ApiError(404,"User not found");
    }
    return {
        skillsOffered:user.skillsOffered,
        skillsWanted:user.skillsWanted
    }
}