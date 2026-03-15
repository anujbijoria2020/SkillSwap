import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env'
import authRouter from './modules/auth/auth.routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/', (_, res) => res.send('SkillSwapNetwork API running'))

app.use('/api/auth', authRouter)

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
})

export default app