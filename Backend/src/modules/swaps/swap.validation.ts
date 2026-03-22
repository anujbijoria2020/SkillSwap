import { z } from "zod"

export const createSwapSchema = z.object({
    receiverId: z.string().uuid("Invalid receiver ID").optional(),
    toUserId: z.string().uuid("Invalid receiver ID").optional(),
}).refine((data) => Boolean(data.receiverId || data.toUserId), {
    message: "receiverId or toUserId is required"
})

export const respondSwapSchema = z.object({
    accept: z.boolean()
})

export type CreateSwapInput = z.infer<typeof createSwapSchema>
export type RespondSwapInput = z.infer<typeof respondSwapSchema>