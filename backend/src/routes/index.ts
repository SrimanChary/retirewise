import { Router } from 'express'
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller'
import { getAccounts, getAccount, createAccount, updateAllocations, getReconciliation } from '../controllers/account.controller'
import { getTransactions, createTransaction } from '../controllers/transaction.controller'
import { getPortfolioSummary, getProjection } from '../controllers/portfolio.controller'
import { getAdvice } from '../controllers/advisor.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.post('/auth/register', authLimiter, register)
router.post('/auth/login', authLimiter, login)
router.post('/auth/refresh', refresh)
router.post('/auth/logout', logout)
router.get('/auth/me', authenticate, getMe)

router.get('/accounts', authenticate, getAccounts)
router.get('/accounts/:id', authenticate, getAccount)
router.post('/accounts', authenticate, createAccount)
router.put('/accounts/:id/allocations', authenticate, updateAllocations)
router.get('/accounts/:id/reconcile', authenticate, getReconciliation)

router.get('/accounts/:accountId/transactions', authenticate, getTransactions)
router.post('/accounts/:accountId/transactions', authenticate, createTransaction)

router.get('/portfolio/summary', authenticate, getPortfolioSummary)
router.post('/portfolio/projection', authenticate, getProjection)

router.post('/advisor/advice', authenticate, getAdvice)

export default router
