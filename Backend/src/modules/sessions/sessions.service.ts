// createSession(userId, data: CreateSessionInput)
// 1. find swap by swapId → ApiError(404, 'Swap not found')
// 2. check swap.status === 'ACCEPTED' → ApiError(400, 'Swap must be accepted first')
// 3. check userId === swap.initiatorId OR swap.receiverId → ApiError(403, 'Not authorized')
// 4. prisma.session.create with swapId, userId, scheduledAt, meetLink
// 5. return session

// getMySessions(userId)
// → prisma.session.findMany where userId === userId
// → include swap

// getSessionById(userId, sessionId)
// 1. find session → ApiError(404)
// 2. check userId === session.userId → ApiError(403)
// 3. return session with swap

// updateSession(userId, sessionId, data: UpdateSessionInput)
// 1. find session → ApiError(404)
// 2. check userId === session.userId → ApiError(403)
// 3. check status === SCHEDULED → ApiError(400, 'Cannot update completed or cancelled session')
// 4. prisma.session.update
// 5. return updated session

// completeSession(userId, sessionId)
// 1. find session → ApiError(404)
// 2. check userId === session.userId → ApiError(403)
// 3. update status to COMPLETED
// 4. return updated session

// cancelSession(userId, sessionId)
// 1. find session → ApiError(404)
// 2. check userId === session.userId → ApiError(403)
// 3. check status === SCHEDULED → ApiError(400, 'Session already completed or cancelled')
// 4. update status to CANCELLED
// 5. return updated session

import ApiError from "../../utils/ApiError"
import { prisma } from "../../config/prisma"
import { CreateSessionInput, UpdateSessionInput } from "./sessions.validation"

export const createSession = async (userId: string, data: CreateSessionInput) => {
     const swap = await prisma.swap.findUnique({
        where: { id: data.swapId },
        include: {
            initiator: true,
            receiver: true
        }
    })
    if(!swap){
        throw new ApiError(404, 'Swap not found')
    }
    if(swap.status !== 'ACCEPTED'){
        throw new ApiError(400, 'Swap must be accepted first')
    }
    if(swap.initiatorId !== userId && swap.receiverId !== userId){
        throw new ApiError(403, 'Not authorized')
    }
    const session = await prisma.session.create({
        data: {
            swapId: data.swapId,
            userId,
            scheduledAt: new Date(data.scheduledAt),
            meetLink: data.meetLink
        }
    })
    return session
}

export const getMySessions = async (userId: string) => {
    const sessions = await prisma.session.findMany({
        where: { userId },
        include: {
            swap: {
                include: {
                    initiator: true,
                    receiver: true
                }
            }
        }
    })
    return sessions
}

export const getSessionById = async (userId: string, sessionId: string) => {
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
            swap: {
                include: {
                    initiator: true,
                    receiver: true
                }
            }
        }
    })
    if(!session){
        throw new ApiError(404, 'Session not found')
    }
    if(session.userId !== userId){
        throw new ApiError(403, 'Not authorized')
    }
    return session
}

export const updateSession = async (userId: string, sessionId: string, data: UpdateSessionInput) => {
    const session = await prisma.session.findUnique({
        where: { id: sessionId }
    })
    if(!session){
        throw new ApiError(404, 'Session not found')
    }
    if(session.userId !== userId){
        throw new ApiError(403, 'Not authorized')
    }
    if(session.status !== 'SCHEDULED'){
        throw new ApiError(400, 'Cannot update completed or cancelled session')
    }

 const updatedSession = await prisma.session.update({
  where: { id: sessionId },
  data: {
    ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
    ...(data.meetLink && { meetLink: data.meetLink }),
  }
})
    return updatedSession
}

export const completeSession = async (userId: string, sessionId: string) => {
    const session = await prisma.session.findUnique({
        where: { id: sessionId }
    })
    if(!session){
        throw new ApiError(404, 'Session not found')
    }
    if(session.userId !== userId){
        throw new ApiError(403, 'Not authorized')
    }
    const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED' }
    })
    return updatedSession
}

export const cancelSession = async (userId: string, sessionId: string) => {
    const session = await prisma.session.findUnique({
        where: { id: sessionId }
    })
    if(!session){
        throw new ApiError(404, 'Session not found')
    }
    if(session.userId !== userId){
        throw new ApiError(403, 'Not authorized')
    }
    if(session.status !== 'SCHEDULED'){
        throw new ApiError(400, 'Session already completed or cancelled')
    }
    const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: { status: 'CANCELLED' }
    })
    return updatedSession
}



