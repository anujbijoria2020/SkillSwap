// createReview(reviewerId, data: CreateReviewInput)
// 1. find session by sessionId → ApiError(404, 'Session not found')
// 2. check session.status === 'COMPLETED' → ApiError(400, 'Session must be completed first')
// 3. find swap from session.swapId to get initiatorId and receiverId
// 4. check reviewerId === swap.initiatorId OR swap.receiverId → ApiError(403, 'Not authorized')
// 5. check revieweeId === swap.initiatorId OR swap.receiverId → ApiError(400, 'Invalid reviewee')
// 6. check reviewerId !== revieweeId → ApiError(400, 'Cannot review yourself')
// 7. check no existing review for this sessionId → ApiError(409, 'Already reviewed this session')
// 8. prisma.review.create
// 9. return review

// getReviewsForUser(userId)
// → prisma.review.findMany where revieweeId === userId
// → include reviewer: { select: { id, name, avatarUrl } }
// → return reviews

// getReviewById(reviewId)
// → prisma.review.findUnique where id === reviewId
// → ApiError(404, 'Review not found') if null
// → return review


import ApiError from "../../utils/ApiError";
import { CreateReviewInput } from "./reviews.validation";
import { prisma } from "../../config/prisma";
import { createNotification } from "../notifications/notification.services";
import { logger } from "../../config/logger";

export const createReview = async(reviewerId:string,data:CreateReviewInput)=>{
    const {sessionId,revieweeId,rating,comment} = data;
    const session = await prisma.session.findUnique({
        where:{id:sessionId},
        include:{
            swap:true
        }
    })
    if(!session){
        throw new ApiError(404, 'Session not found')
    }
    if(session.status !== 'COMPLETED'){
        throw new ApiError(400, 'Session must be completed first')
    }
    const swap = session.swap;
    if(reviewerId !== swap.initiatorId && reviewerId !== swap.receiverId){
        throw new ApiError(403, 'Not authorized')
    }
    if(revieweeId !== swap.initiatorId && revieweeId !== swap.receiverId){
        throw new ApiError(400, 'Invalid reviewee')
    }
    if(reviewerId === revieweeId){
        throw new ApiError(400, 'Cannot review yourself')
    }
    const existingReview = await prisma.review.findUnique({
        where:{sessionId}
    })
    if(existingReview){
        throw new ApiError(409, 'Already reviewed this session')
    }
    const review = await prisma.review.create({
        data:{
            reviewerId,
            revieweeId,
            sessionId,
            rating,
            comment
        }
    })
    try {
        const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } })

        await createNotification(
            revieweeId,
            reviewerId,
            'new_review',
            `${reviewer?.name} left you a review`,
            '/me'
        )
    } catch (error) {
        logger.error('Failed to create review notification', {
            reviewerId,
            revieweeId,
            error
        })
    }
    return review;
}

export const getReviewsForUser = async(userId:string)=>{
    const reviews = await prisma.review.findMany({
        where:{revieweeId:userId},
        include:{
            reviewer:{
                select:{
                    id:true,
                    name:true,
                    avatarUrl:true
                }
            }
        }
    })
    return reviews;
}

export const getReviewById = async(reviewId:string)=>{
    const review = await prisma.review.findUnique({
        where:{id:reviewId}
    })
    if(!review){
        throw new ApiError(404, 'Review not found')
    }
    return review;
}

export const getReviewsBySessionId = async(sessionId:string)=>{
    const reviews = await prisma.review.findMany({
        where:{sessionId}
    })
    return reviews;
}

