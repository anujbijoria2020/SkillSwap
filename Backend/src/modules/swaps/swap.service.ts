import { logger } from "../../config/logger"
import { prisma } from "../../config/prisma"
import ApiError from "../../utils/ApiError"
import { createNotification } from "../notifications/notification.services"
import { CreateSwapInput } from "./swap.validation"

const mapUserProfile = (user: {
  id: string
  name: string
  email: string
  bio: string | null
  avatarUrl: string | null
  location: string | null
  availability: string[]
  skillsOffered: { name: string }[]
  skillsWanted: { name: string }[]
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  avatar: user.avatarUrl,
  location: user.location,
  availability: user.availability,
  skillsOffering: user.skillsOffered.map((s) => s.name),
  skillsWanted: user.skillsWanted.map((s) => s.name),
})

const mapSwapRequest = (swap: {
  id: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED"
  skillOffered: string
  skillWanted: string
  createdAt: Date
  initiator: {
    id: string
    name: string
    avatarUrl: string | null
    skillsOffered: { name: string }[]
    skillsWanted: { name: string }[]
  }
  receiver: {
    id: string
    name: string
    avatarUrl: string | null
    skillsOffered: { name: string }[]
    skillsWanted: { name: string }[]
  }
}) => ({
  id: swap.id,
  status: swap.status.toLowerCase(),
  fromUser: {
    id: swap.initiator.id,
    name: swap.initiator.name,
    avatar: swap.initiator.avatarUrl,
    skillsOffering: swap.initiator.skillsOffered.map((s) => s.name),
    skillsWanted: swap.initiator.skillsWanted.map((s) => s.name),
  },
  toUser: {
    id: swap.receiver.id,
    name: swap.receiver.name,
    avatar: swap.receiver.avatarUrl,
    skillsOffering: swap.receiver.skillsOffered.map((s) => s.name),
    skillsWanted: swap.receiver.skillsWanted.map((s) => s.name),
  },
  offeredSkill: swap.skillOffered,
  wantedSkill: swap.skillWanted,
  createdAt: swap.createdAt,
})

export const browseUsers = async (userId: string) => {
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      AND: [
        {
          receivedSwaps: {
            none: {
              initiatorId: userId,
              status: { in: ["PENDING", "ACCEPTED"] }
            }
          }
        },
        {
          initiatedSwaps: {
            none: {
              receiverId: userId,
              status: { in: ["PENDING", "ACCEPTED"] }
            }
          }
        }
      ]
    },
    include: {
      skillsOffered: { select: { name: true } },
      skillsWanted: { select: { name: true } }
    }
  })
  logger.info(`User ${userId} browsed users, found ${users.length} results`);

  return users.map(mapUserProfile)
}

export const sendSwapRequest = async (initiatorId: string, data: CreateSwapInput) => {
  const receiverId = data.receiverId || data.toUserId

  if (!receiverId) {
    throw new ApiError(400, "receiverId or toUserId is required")
  }

  if (initiatorId === receiverId) {
    throw new ApiError(400, "Cannot send swap request to yourself")
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    include: { skillsOffered: true, skillsWanted: true }
  })
  if (!receiver) throw new ApiError(404, "User not found")

  // get initiator's skills
  const initiator = await prisma.user.findUnique({
    where: { id: initiatorId },
    include: { skillsOffered: true, skillsWanted: true }
  })

  // check both have skills
  if (!initiator?.skillsOffered.length) {
    throw new ApiError(400, "Add skills to your profile first")
  }
  if (!receiver.skillsOffered.length) {
    throw new ApiError(400, "This user has no skills to offer")
  }

  // check existing swap
  const existingSwap = await prisma.swap.findFirst({
    where: {
      OR: [
        { initiatorId, receiverId, status: "PENDING" },
        { initiatorId: receiverId, receiverId: initiatorId, status: "PENDING" }
      ]
    }
  })
  if (existingSwap) throw new ApiError(409, "Swap request already exists")

  // use profile skills automatically
  const skillOffered = initiator.skillsOffered.map(s => s.name).join(", ")
  const skillWanted = initiator.skillsWanted.map(s => s.name).join(", ")

  const swap = await prisma.swap.create({
    data: { initiatorId, receiverId, skillOffered, skillWanted }
  });
  const intiator = await prisma.user.findUnique({ where: { id: initiatorId } });

  try {
    await createNotification(
      receiverId,
      initiatorId,
      "swap_request",
      `${intiator?.name} has sent you a swap request!`,
      `/swaps/${swap.id}`
    )
  } catch (error) {
    logger.error("Failed to create swap notification", {
      notificationType: "swap_request",
      swapId: swap.id,
      receiverId,
      initiatorId,
      error,
    })
  }
    
  logger.info(`Swap request created: ${swap.id} from user ${initiatorId} to user ${receiverId}`);

  return swap
}

export const respondToSwap = async (userId: string, swapId: string, accept: boolean) => {
  const swap = await prisma.swap.findUnique({ where: { id: swapId } })
  if (!swap) throw new ApiError(404, "Swap not found")
  if (swap.receiverId !== userId) throw new ApiError(403, "Not authorized")
  if (swap.status !== "PENDING") throw new ApiError(400, "Swap is not pending")

  const updated = await prisma.swap.update({
    where: { id: swapId },
    data: { status: accept ? "ACCEPTED" : "REJECTED" }
  })
// only notify on accept
if (accept) {
  const receiver = await prisma.user.findUnique({ where: { id: userId } })
  try {
    await createNotification(
      swap.initiatorId,
      userId,
      'swap_accepted',
      `${receiver?.name} accepted your swap request`,
      '/swaps'
    )
  } catch (error) {
    logger.error("Failed to create swap notification", {
      notificationType: "swap_accepted",
      swapId: swap.id,
      receiverId: swap.initiatorId,
      initiatorId: userId,
      error,
    })
  }
}
  logger.info(`Swap ${accept ? "accepted" : "rejected"}: ${swapId} by user ${userId}`);

  return updated
}

export const getIncomingSwaps = async (userId: string) => {
  const swaps = await prisma.swap.findMany({
    where: { receiverId: userId },
    include: {
      initiator: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          skillsOffered: { select: { name: true } },
          skillsWanted: { select: { name: true } }
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          skillsOffered: { select: { name: true } },
          skillsWanted: { select: { name: true } }
        }
      }
    }
  })

  return swaps.map(mapSwapRequest)
}

export const getOutgoingSwaps = async (userId: string) => {
  const swaps = await prisma.swap.findMany({
    where: { initiatorId: userId },
    include: {
      initiator: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          skillsOffered: { select: { name: true } },
          skillsWanted: { select: { name: true } }
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          skillsOffered: { select: { name: true } },
          skillsWanted: { select: { name: true } }
        }
      }
    }
  })

  return swaps.map(mapSwapRequest)
}

export const getSwapById = async (userId: string, swapId: string) => {
  const swap = await prisma.swap.findUnique({
    where: { id: swapId },
    include: {
      initiator: { include: { skillsOffered: true, skillsWanted: true } },
      receiver: { include: { skillsOffered: true, skillsWanted: true } }
    }
  })

  if (!swap) throw new ApiError(404, "Swap not found")
  if (swap.initiatorId !== userId && swap.receiverId !== userId) {
    throw new ApiError(403, "Not authorized")
  }

  return swap
}

export const cancelSwap = async (userId: string, swapId: string) => {
  const swap = await prisma.swap.findUnique({ where: { id: swapId } })
  if (!swap) throw new ApiError(404, "Swap not found")
  if (swap.initiatorId !== userId) throw new ApiError(403, "Not authorized")
  if (swap.status !== "PENDING") throw new ApiError(400, "Can only cancel pending swaps")
  logger.info(`Swap cancelled: ${swapId} by user ${userId}`);

  return prisma.swap.update({
    where: { id: swapId },
    data: { status: "CANCELLED" }
  })
}