import {Router} from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createReviewController, getReviewByIdController, getReviewsBySessionIdController, getReviewsForUserController } from "./reviews.controllers";
import { createReviewSchema } from "./reviews.validation";

const reviewRouter = Router();

reviewRouter.post("/", authMiddleware, validate(createReviewSchema), createReviewController);
reviewRouter.get("/user/:userid", authMiddleware, getReviewsForUserController);
reviewRouter.get("/session/:sessionid", authMiddleware, getReviewsBySessionIdController);
reviewRouter.get("/:reviewid", authMiddleware, getReviewByIdController);

export default reviewRouter;