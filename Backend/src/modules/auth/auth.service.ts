import ApiError from "../../utils/ApiError";
import { prisma } from "../../config/prisma";
import { RegisterInput, LoginInput } from "./auth.validation";
import { comparePassword, hashPassword } from "../../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

export const register = async (input: RegisterInput) => {
  const { name, email, password } = input;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  const hashedRefreshToken = await hashPassword(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
  });

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const login = async (input: LoginInput) => {
  const { email, password } = input;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  const hashedRefreshToken = await hashPassword(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refresh = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findMany({
    where: { userId: payload.userId },
  });
  let matchedToken = null;
  for (const token of storedToken) {
    const isValid = await comparePassword(refreshToken, token.token);
    if (isValid) {
      matchedToken = token;
      break;
    }
  }
  if (!matchedToken) throw new ApiError(401, "Invalid refresh token");
  if (matchedToken.expiresAt < new Date())
    throw new ApiError(401, "Refresh token expired");
  await prisma.refreshToken.delete({ where: { id: matchedToken.id } });

  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
  });
  const newRefreshToken = generateRefreshToken({
    userId: payload.userId,
    email: payload.email,
  });

  const hashedRefreshToken = await hashPassword(newRefreshToken);
  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findMany({
    where: { userId: payload.userId },
  });
  for (const token of storedToken) {
    const isValid = await comparePassword(refreshToken, token.token);
    if (isValid) {
      await prisma.refreshToken.delete({ where: { id: token.id } });
      return;
    }
  }
  throw new ApiError(401, "Invalid refresh token");
};
