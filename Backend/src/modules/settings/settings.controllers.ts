import { Request, Response, NextFunction } from "express"
import { getSettings, updateSettings } from "./settings.services"

export const getSettingsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const settings = await getSettings(userId)
    res.status(200).json({
      success: true,
      message: 'Settings fetched successfully',
      data: settings
    })
  } catch (error) {
    next(error)
  }
}

export const updateSettingsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const data = req.body
    const updatedSettings = await updateSettings(userId, data)
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    })
  } catch (error) {
    next(error)
  }
}