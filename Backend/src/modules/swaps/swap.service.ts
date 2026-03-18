// browseUsers(userId: string)
// → find all users except self
// → include skillsOffered and skillsWanted
// → exclude users who already have a PENDING or ACCEPTED swap with current user
// → return users without passwords

// sendSwapRequest(initiatorId: string, data: CreateSwapInput)
// data = { receiverId, skillOffered, skillWanted }
// 1. check receiver exists → ApiError(404, 'User not found')
// 2. check not sending to self → ApiError(400, 'Cannot send swap request to yourself')
// 3. check no existing PENDING swap between these two users → ApiError(409, 'Swap request already exists')
// 4. prisma.swap.create with status PENDING
// 5. return swap

// respondToSwap(userId: string, swapId: string, accept: boolean)
// 1. find swap by id → ApiError(404, 'Swap not found')
// 2. check userId === swap.receiverId → ApiError(403, 'Not authorized')
// 3. check swap.status === PENDING → ApiError(400, 'Swap is not pending')
// 4. update status to ACCEPTED or REJECTED based on accept boolean
// 5. return updated swap

// getIncomingSwaps(userId: string)
// → prisma.swap.findMany where receiverId === userId
// → include initiator with skills

// getOutgoingSwaps(userId: string)
// → prisma.swap.findMany where initiatorId === userId
// → include receiver with skills

// getSwapById(userId: string, swapId: string)
// 1. find swap by id → ApiError(404, 'Swap not found')
// 2. check userId === swap.initiatorId OR swap.receiverId → ApiError(403, 'Not authorized')
// 3. return swap with both users and their skills

// cancelSwap(userId: string, swapId: string)
// 1. find swap → ApiError(404)
// 2. check userId === swap.initiatorId → ApiError(403, 'Not authorized')
// 3. check status === PENDING → ApiError(400, 'Can only cancel pending swaps')
// 4. update status to CANCELLED
// 5. return updated swap

import { prisma } from "../../config/prisma"
import ApiError from "../../utils/ApiError"
import { CreateSwapInput } from "./swap.validation"

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
      skillsOffered: true,
      skillsWanted: true
    }
  })

  return users.map(({ password, ...rest }) => rest)
}

export const sendSwapRequest = async (initiatorId: string, data: CreateSwapInput) => {
  const { receiverId } = data

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
  })

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

  return updated
}

export const getIncomingSwaps = async (userId: string) => {
  return prisma.swap.findMany({
    where: { receiverId: userId },
    include: {
      initiator: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          skillsOffered: true,
          skillsWanted: true
        }
      }
    }
  })
}

export const getOutgoingSwaps = async (userId: string) => {
  return prisma.swap.findMany({
    where: { initiatorId: userId },
    include: {
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          skillsOffered: true,
          skillsWanted: true
        }
      }
    }
  })
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

  return prisma.swap.update({
    where: { id: swapId },
    data: { status: "CANCELLED" }
  })
}