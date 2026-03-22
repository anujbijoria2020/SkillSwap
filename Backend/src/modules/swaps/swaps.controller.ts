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
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: result,
    })
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
      message: 'Swap request created successfully',
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
      message: accept ? 'Swap accepted successfully' : 'Swap rejected successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const acceptSwapController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const swapId = req.params.id as string
    const result = await respondToSwap(userId, swapId, true)
    res.status(200).json({
      success: true,
      message: 'Swap accepted successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const rejectSwapController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const swapId = req.params.id as string
    const result = await respondToSwap(userId, swapId, false)
    res.status(200).json({
      success: true,
      message: 'Swap rejected successfully',
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
    res.status(200).json({
      success: true,
      message: 'Incoming swaps fetched successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getOutgoingSwapsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const result = await getOutgoingSwaps(userId)
    res.status(200).json({
      success: true,
      message: 'Outgoing swaps fetched successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getSwapByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const swapId = req.params.id as string
    const result = await getSwapById(userId, swapId)
    res.status(200).json({
      success: true,
      message: 'Swap fetched successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelSwapController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const swapId = req.params.id as string
    await cancelSwap(userId, swapId)
    res.status(200).json({
      success: true,
      message: 'Swap cancelled successfully',
      data: null,
    })
  } catch (error) {
    next(error)
  }
}