import { z } from "zod"

export const createSwapSchema = z.object({
    receiverId: z.string().uuid("Invalid receiver ID"),
    skillOffered: z.string().min(2, "Skill offered must be at least 2 characters"),
    skillWanted: z.string().min(2, "Skill wanted must be at least 2 characters"),
})

export const respondSwapSchema = z.object({
    accept: z.boolean()
})

export type CreateSwapInput = z.infer<typeof createSwapSchema>
export type RespondSwapInput = z.infer<typeof respondSwapSchema>