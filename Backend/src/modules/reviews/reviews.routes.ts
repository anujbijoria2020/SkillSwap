import {Router} from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createReviewController, getReviewByIdController, getReviewsBySessionIdController, getReviewsForUserController } from "./reviews.controllers";
import { createReviewSchema } from "./reviews.validation";

const reviewRouter = Router();

reviewRouter.post("/", authMiddleware, validate(createReviewSchema), createReviewController);
reviewRouter.get("/users/:id", authMiddleware, getReviewsForUserController);
reviewRouter.get("/sessions/:id", authMiddleware, getReviewsBySessionIdController);
reviewRouter.get("/:id", authMiddleware, getReviewByIdController);

export default reviewRouter;