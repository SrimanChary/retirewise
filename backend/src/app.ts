import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimiter } from './middleware/rateLimit.middleware'
import routes from './routes/index'
import { logger } from './utils/logger'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(rateLimiter)

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.use('/api/v1', routes)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message })
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => logger.info(`RetireWise API running on http://localhost:${PORT}`))

export default app
