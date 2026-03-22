import { Router } from "express"
import { authMiddleware } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate.middleware"
import { getSettingsController, updateSettingsController } from "./settings.controllers"
import { updateSettingsSchema } from "./settings.validation"

const settingsRouter = Router()

settingsRouter.get('/', authMiddleware, getSettingsController)
settingsRouter.patch('/', authMiddleware, validate(updateSettingsSchema), updateSettingsController)

export default settingsRouter