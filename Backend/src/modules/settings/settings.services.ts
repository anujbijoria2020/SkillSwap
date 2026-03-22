import { prisma } from '../../config/prisma'
import { UpdateSettingsInput } from './settings.validation'

export const getSettings = async (userId: string) => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId }
  })

  if (!settings) {
    return prisma.userSettings.create({
      data: { userId }
    })
  }

  return settings
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