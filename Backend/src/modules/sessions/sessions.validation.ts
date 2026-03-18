// createSessionSchema:
// - swapId: string uuid
// - scheduledAt: string datetime (use z.string().datetime())
// - meetLink: string url, optional

import z from "zod";

// updateSessionSchema:
// - scheduledAt: string datetime, optional
// - meetLink: string url, optional

// export CreateSessionInput and UpdateSessionInput types

export const createSessionSchema = z.object({
    swapId: z.string().uuid("Invalid swap ID"),
    scheduledAt: z.string().datetime("Invalid datetime format"),
    meetLink: z.string().url("Invalid URL").optional(),
})

export const updateSessionSchema = z.object({
    scheduledAt: z.string().datetime("Invalid datetime format").optional(),
    meetLink: z.string().url("Invalid URL").optional(),
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional()
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

