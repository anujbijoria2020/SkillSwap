import { Router } from "express";
import { completeSessionController, createSessionController, deleteSessionController, getMySessionsController, getSessionByIdController, updateSessionController } from "./sessions.controllers";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createSessionSchema, updateSessionSchema } from "./sessions.validation";


const sessionRouter = Router();

sessionRouter.post("/",authMiddleware, validate(createSessionSchema),createSessionController);
sessionRouter.get("/", authMiddleware, getMySessionsController);
sessionRouter.get("/:id", authMiddleware, getSessionByIdController);
sessionRouter.put("/:id", authMiddleware,validate(updateSessionSchema), updateSessionController);
sessionRouter.patch("/:id/complete", authMiddleware, completeSessionController);
sessionRouter.delete("/:id", authMiddleware, deleteSessionController);

export default sessionRouter;
