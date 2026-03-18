import z from "zod";

export const createReviewSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  revieweeId: z.string().uuid("Invalid reviewee ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>