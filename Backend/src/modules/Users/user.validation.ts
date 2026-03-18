import z from "zod";


export const updateUserSchema  = z.object({
    name:z.string().min(2,"Name must be at least 2 characters long").optional(),
    bio:z.string().max(500,"Bio must be less than 500 characters").optional(),
    avatarUrl:z.string().url("Invalid URL").optional(),
})


export const skillsSchema = z.object({
  skills: z.array(
    z.string().min(2, "Skill name must be at least 2 characters")
  ).min(1, "At least one skill is required")
})

export type SkillsInput = z.infer<typeof skillsSchema>
export type updateUserInput = z.infer<typeof updateUserSchema>