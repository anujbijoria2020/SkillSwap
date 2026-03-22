import { z } from 'zod'

export const updateSettingsSchema = z.object({
  discovery: z.boolean().optional(),
  dmsFromAnyone: z.boolean().optional(),
  showPoints: z.boolean().optional(),
  notifSwaps: z.boolean().optional(),
  notifMessages: z.boolean().optional(),
  notifReviews: z.boolean().optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>