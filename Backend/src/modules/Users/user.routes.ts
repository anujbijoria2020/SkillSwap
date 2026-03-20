import {Router} from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { addSkillsOfferedController, addSkillsWantedController, deleteMeController, getAllUsersController, getMeController, getMySkillsController, getUserByIdController, removeSkillsOfferedController, removeSkillsWantedController, updateMeController } from "./users.controllers";
import { validate } from "../../middleware/validate.middleware";
import { skillsSchema, updateUserSchema } from "./user.validation";

const userRouter = Router();

// specific routes first
userRouter.get("/me", authMiddleware, getMeController);
userRouter.put("/me", authMiddleware, validate(updateUserSchema), updateMeController);
userRouter.delete("/me", authMiddleware, deleteMeController);
userRouter.get("/", getAllUsersController);

// skills routes before /:id
userRouter.post("/skills/offered", authMiddleware, validate(skillsSchema), addSkillsOfferedController);
userRouter.post("/skills/wanted", authMiddleware, validate(skillsSchema), addSkillsWantedController);
userRouter.get("/skills/me", authMiddleware, getMySkillsController);
userRouter.delete("/skills/offered/:skillId", authMiddleware, removeSkillsOfferedController);
userRouter.delete("/skills/wanted/:skillId", authMiddleware, removeSkillsWantedController);

// dynamic route always last
userRouter.get("/:id", getUserByIdController);

export default userRouter;