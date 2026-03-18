import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env'
import { initSocket } from './socket'
import authRouter from './modules/auth/auth.routes'
import userRouter from './modules/Users/user.routes'
import swapRouter from './modules/swaps/swaps.routes'
import sessionRouter from './modules/sessions/sessions.routes'
import reviewRouter from './modules/reviews/reviews.routes'
import messageRouter from './modules/messages/messages.routes'
import { errorMiddleware } from './middleware/error.middleware'
import cookieParser from 'cookie-parser'

const app = express()
const httpServer = createServer(app)  // wrap express in http server

// init socket
initSocket(httpServer)

app.use(helmet())
app.use(cors())
app.use(cookieParser())
app.use(express.json())

app.get('/', (_, res) => res.send('SkillSwapNetwork API running'))

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/swaps', swapRouter)
app.use('/api/sessions', sessionRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/messages', messageRouter)
app.use(errorMiddleware)

// use httpServer instead of app.listen
httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
})

export default app