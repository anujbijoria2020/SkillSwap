import dotenv from 'dotenv'
dotenv.config()

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_TOKEN_EXPIRES_IN',
  'JWT_REFRESH_TOKEN_EXPIRES_IN',
  'PORT',
  'NODE_ENV',
] as const

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  PORT: parseInt(process.env.PORT!, 10),
  NODE_ENV: process.env.NODE_ENV! as 'development' | 'production' | 'test',
  JWT_ACCESS_TOKEN_EXPIRES_IN:process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,
  JWT_REFRESH_TOKEN_EXPIRES_IN:process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!,
}