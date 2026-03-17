import { Request, Response, NextFunction } from "express"
import {
  createSession,
  getMySessions,
  getSessionById,
  updateSession,
  completeSession,
  cancelSession
} from "./sessions.service"
import { CreateSessionInput, UpdateSessionInput } from "./sessions.validation"

export const createSessionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const data = req.body as CreateSessionInput
    const result = await createSession(userId, data)
    res.status(201).json({ success: true, message: "Session scheduled", data: result })
  } catch (error) {
    next(error)
  }
}

export const getMySessionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const result = await getMySessions(userId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const getSessionByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const sessionId = req.params.sessionid as string
    const result = await getSessionById(userId, sessionId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const updateSessionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const sessionId = req.params.sessionid as string
    const data = req.body as UpdateSessionInput
    const result = await updateSession(userId, sessionId, data)
    res.status(200).json({ success: true, message: "Session updated", data: result })
  } catch (error) {
    next(error)
  }
}

export const completeSessionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const sessionId = req.params.sessionid as string
    const result = await completeSession(userId, sessionId)
    res.status(200).json({ success: true, message: "Session completed", data: result })
  } catch (error) {
    next(error)
  }
}

export const cancelSessionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const sessionId = req.params.sessionid as string
    const result = await cancelSession(userId, sessionId)
    res.status(200).json({ success: true, message: "Session cancelled", data: result })
  } catch (error) {
    next(error)
  }
}