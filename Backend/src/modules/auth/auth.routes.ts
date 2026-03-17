import { Router } from "express";
import { loginController, logoutController, refreshController, registerController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validation";
const authRouter = Router();

authRouter.post("/register",validate(registerSchema), registerController);
authRouter.post("/login", validate(loginSchema),loginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

export default authRouter;