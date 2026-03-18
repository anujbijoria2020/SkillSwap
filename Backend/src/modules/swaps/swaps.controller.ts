import { Request, Response, NextFunction } from "express"
import {
  browseUsers,
  cancelSwap,
  getIncomingSwaps,
  getOutgoingSwaps,
  getSwapById,
  respondToSwap,
  sendSwapRequest
} from "./swap.service"
import { CreateSwapInput, RespondSwapInput } from "./swap.validation"

export const browseUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const result = await browseUsers(userId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const sendSwapRequestController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initiatorId = req.user?.userId!
    const data = req.body as CreateSwapInput
    const result = await sendSwapRequest(initiatorId, data)
    res.status(201).json({
      success: true,
      message: "Swap request sent",
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const respondToSwapController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const swapId = req.params.id as string
    const { accept } = req.body as RespondSwapInput
    const result = await respondToSwap(userId, swapId, accept)
    res.status(200).json({
      success: true,
      message: accept ? "Swap accepted" : "Swap rejected",
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const getIncomingSwapsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const result = await getIncomingSwaps(userId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const getOutgoingSwapsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const result = await getOutgoingSwaps(userId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const getSwapByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const swapId = req.params.id as string
    const result = await getSwapById(userId, swapId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

export const cancelSwapController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const swapId = req.params.id as string
    const result = await cancelSwap(userId, swapId)
    res.status(200).json({
      success: true,
      message: "Swap cancelled",
      data: result
    })
  } catch (error) {
    next(error)
  }
}