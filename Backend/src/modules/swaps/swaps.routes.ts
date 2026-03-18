import { Router } from "express"
import { authMiddleware } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate.middleware"
import { createSwapSchema, respondSwapSchema } from "./swap.validation"
import {
  browseUsersController,
  cancelSwapController,
  getIncomingSwapsController,
  getOutgoingSwapsController,
  getSwapByIdController,
  respondToSwapController,
  sendSwapRequestController
} from "./swaps.controller"

const swapRouter = Router()

// specific routes first
swapRouter.get("/browse", authMiddleware, browseUsersController)
swapRouter.get("/incoming", authMiddleware, getIncomingSwapsController)
swapRouter.get("/outgoing", authMiddleware, getOutgoingSwapsController)
swapRouter.post("/createSwap", authMiddleware, validate(createSwapSchema), sendSwapRequestController)

// dynamic routes last
swapRouter.put("/:swapid/respond", authMiddleware, validate(respondSwapSchema), respondToSwapController)
swapRouter.get("/:swapid", authMiddleware, getSwapByIdController)
swapRouter.delete("/:swapid", authMiddleware, cancelSwapController)

export default swapRouter