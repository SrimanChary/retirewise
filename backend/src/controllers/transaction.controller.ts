import { Request, Response } from 'express'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../utils/prisma'
import { processContribution, processWithdrawal } from '../services/ledger.service'
import { logger } from '../utils/logger'

export async function createTransaction(req: Request, res: Response) {
  const { accountId } = req.params
  const { type, amount, description, idempotencyKey } = req.body
  const userId = (req as any).user.userId
  if (!type || !amount || amount <= 0) return res.status(400).json({ error: 'type and positive amount required' })

  try {
    const account = await prisma.account.findFirst({ where: { id: accountId, userId } })
    if (!account) return res.status(404).json({ error: 'Account not found' })

    if (idempotencyKey) {
      const existing = await prisma.transaction.findUnique({ where: { idempotencyKey } })
      if (existing) return res.json({ transaction: existing, idempotent: true })
    }

    const transaction = await prisma.transaction.create({
      data: { accountId, type, amount: new Decimal(amount), description, idempotencyKey, status: 'PENDING' },
    })

    let result
    if (type === 'CONTRIBUTION' || type === 'DIVIDEND') {
      result = await processContribution(accountId, transaction.id, Number(amount), description || type)
    } else {
      result = await processWithdrawal(accountId, transaction.id, Number(amount), description || type)
    }

    await prisma.auditLog.create({
      data: { userId, action: `TRANSACTION_${type}`, entity: 'Transaction', entityId: transaction.id, metadata: { amount, newBalance: result.newBalance }, ipAddress: req.ip },
    })
    return res.status(201).json({ transaction: { ...transaction, status: 'SETTLED' }, newBalance: result.newBalance })
  } catch (err: any) {
    logger.error('Transaction error', { err: err.message })
    if (err.message?.includes('Insufficient funds')) return res.status(422).json({ error: err.message })
    return res.status(500).json({ error: 'Transaction failed' })
  }
}

export async function getTransactions(req: Request, res: Response) {
  const { accountId } = req.params
  const userId = (req as any).user.userId
  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } })
  if (!account) return res.status(404).json({ error: 'Account not found' })
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({ where: { accountId }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
    prisma.transaction.count({ where: { accountId } }),
  ])
  return res.json({ transactions, total })
}
