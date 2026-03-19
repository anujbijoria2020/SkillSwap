import { Router } from "express";
import { cancelSessionController, completeSessionController, createSessionController, getMySessionsController, getSessionByIdController, updateSessionController } from "./sessions.controllers";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createSessionSchema, updateSessionSchema } from "./sessions.validation";


const sessionRouter = Router();

sessionRouter.post("/",authMiddleware, validate(createSessionSchema),createSessionController);
sessionRouter.get("/", authMiddleware, getMySessionsController);
sessionRouter.get("/:sessionid", authMiddleware, getSessionByIdController);
sessionRouter.put("/:sessionid", authMiddleware,validate(updateSessionSchema), updateSessionController);
sessionRouter.patch("/:sessionid/complete", authMiddleware, completeSessionController);
sessionRouter.patch("/:sessionid/cancel", authMiddleware, cancelSessionController);

export default sessionRouter;
