import { Request, Response, NextFunction } from 'express'
import { login, logout, refresh, register } from "./auth.service";
import { LoginInput, RegisterInput } from "./auth.validation";

// cookie options reused across all controllers
const cookieOptions = {
  httpOnly: true,        // JS in browser cannot read this cookie — protects from XSS
  secure: process.env.NODE_ENV === 'production',  // only sent over HTTPS in prod
  sameSite: 'strict' as const,   // cookie not sent on cross-site requests — protects from CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
}

export const registerController = async(req:Request, res:Response, next:NextFunction) => {
  try {
    const data = req.body as RegisterInput
    const result = await register(data)

    // set refreshToken as HttpOnly cookie — client never sees it in JS
    res.cookie('refreshToken', result.refreshToken, cookieOptions)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken  // accessToken still in body — client stores in memory
      }
    })
  } catch (error) {
    next(error)
  }
}

export const loginController = async(req:Request, res:Response, next:NextFunction) => {
  try {
    const data = req.body as LoginInput
    const result = await login(data)

    // same as register — refreshToken in cookie, accessToken in body
    res.cookie('refreshToken', result.refreshToken, cookieOptions)

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    })
  } catch (error) {
    next(error)
  }
}

export const refreshController = async(req:Request, res:Response, next:NextFunction) => {
  try {
    // read refreshToken from cookie instead of body — browser sends it automatically
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token is required" })
    }

    const result = await refresh(refreshToken)

    // rotate — set new refreshToken cookie, return new accessToken in body
    res.cookie('refreshToken', result.refreshToken, cookieOptions)

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken: result.accessToken }
    })
  } catch (error) {
    next(error)
  }
}

export const logoutController = async(req:Request, res:Response, next:NextFunction) => {
  try {
    // read from cookie
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token is required" })
    }

    await logout(refreshToken)

    // clear the cookie from browser
    res.clearCookie('refreshToken', cookieOptions)

    res.status(200).json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    next(error)
  }
}