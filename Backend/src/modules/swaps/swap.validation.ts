import { z } from "zod"

export const createSwapSchema = z.object({
    receiverId: z.string().uuid("Invalid receiver ID"),
})

export const respondSwapSchema = z.object({
    accept: z.boolean()
})

export type CreateSwapInput = z.infer<typeof createSwapSchema>
export type RespondSwapInput = z.infer<typeof respondSwapSchema>