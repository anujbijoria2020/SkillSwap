import dotenv from 'dotenv'
dotenv.config()

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
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
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
  PORT: parseInt(process.env.PORT!, 10),
  NODE_ENV: process.env.NODE_ENV! as 'development' | 'production' | 'test',
}