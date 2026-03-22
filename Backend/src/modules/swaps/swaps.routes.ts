import { Router } from "express"
import { authMiddleware } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate.middleware"
import { createSwapSchema, respondSwapSchema } from "./swap.validation"
import {
  acceptSwapController,
  browseUsersController,
  cancelSwapController,
  getIncomingSwapsController,
  getOutgoingSwapsController,
  getSwapByIdController,
  rejectSwapController,
  respondToSwapController,
  sendSwapRequestController
} from "./swaps.controller"

const swapRouter = Router()

// specific routes first
swapRouter.get("/", authMiddleware, (req, res, next) => {
  const type = req.query.type
  if (type === "incoming") return getIncomingSwapsController(req, res, next)
  if (type === "outgoing") return getOutgoingSwapsController(req, res, next)
  return browseUsersController(req, res, next)
})
swapRouter.get("/incoming", authMiddleware, getIncomingSwapsController)
swapRouter.get("/outgoing", authMiddleware, getOutgoingSwapsController)
swapRouter.post("/", authMiddleware, validate(createSwapSchema), sendSwapRequestController)
swapRouter.post("/:id/accept", authMiddleware, acceptSwapController)
swapRouter.post("/:id/reject", authMiddleware, rejectSwapController)

// dynamic routes last
swapRouter.patch("/:id/respond", authMiddleware, validate(respondSwapSchema), respondToSwapController)
swapRouter.get("/:id", authMiddleware, getSwapByIdController)
swapRouter.delete("/:id", authMiddleware, cancelSwapController)

export default swapRouter