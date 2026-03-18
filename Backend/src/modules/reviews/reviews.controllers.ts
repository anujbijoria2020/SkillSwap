import { NextFunction ,Request,Response} from "express"
import { createReview, getReviewById, getReviewsBySessionId, getReviewsForUser } from "./reviews.services"

export const createReviewController = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const userId = req.user?.userId!
        const result = await createReview(userId,req.body)
        res.status(201).json({
            success: true,
            message: "Review created",
            data: result
        })
    } catch (error) {
        next(error)
    }
} 

export const getReviewsForUserController = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const userId = req.params.userid as string
        const result = await getReviewsForUser(userId)
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export const getReviewByIdController = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const reviewId = req.params.reviewid as string
        const result = await getReviewById(reviewId)
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export const getReviewsBySessionIdController = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const sessionId = req.params.sessionid as string
        const result = await getReviewsBySessionId(sessionId)
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}
