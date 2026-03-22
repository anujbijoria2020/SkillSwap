import { prisma } from '../../config/prisma'
import { UpdateSettingsInput } from './settings.validation'

export const getSettings = async (userId: string) => {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {}
  })
}

export const updateSettings = async (userId: string, data: UpdateSettingsInput) => {
  return prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      discovery: data.discovery ?? true,
      dmsFromAnyone: data.dmsFromAnyone ?? true,
      showPoints: data.showPoints ?? true,
      notifSwaps: data.notifSwaps ?? true,
      notifMessages: data.notifMessages ?? true,
      notifReviews: data.notifReviews ?? true,
    },
    update: {
      ...data
    }
  })
}