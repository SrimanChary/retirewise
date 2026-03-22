import { Request, Response } from 'express'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../utils/prisma'
import { reconcileBalance } from '../services/ledger.service'

export async function getAccounts(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: { allocations: true, _count: { select: { transactions: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)
  return res.json({ accounts, totalBalance })
}

export async function getAccount(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const account = await prisma.account.findFirst({
    where: { id: req.params.id, userId },
    include: { allocations: true, transactions: { take: 5, orderBy: { createdAt: 'desc' } } },
  })
  if (!account) return res.status(404).json({ error: 'Account not found' })
  return res.json(account)
}

export async function createAccount(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const { type, name, initialBalance = 0 } = req.body
  if (!type || !name) return res.status(400).json({ error: 'type and name required' })
  const account = await prisma.account.create({
    data: { userId, type, name, balance: new Decimal(initialBalance) },
  })
  await prisma.auditLog.create({
    data: { userId, action: 'ACCOUNT_CREATED', entity: 'Account', entityId: account.id, metadata: { type, name } },
  })
  return res.status(201).json(account)
}

export async function updateAllocations(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const { allocations } = req.body
  const account = await prisma.account.findFirst({ where: { id: req.params.id, userId } })
  if (!account) return res.status(404).json({ error: 'Account not found' })
  const total = allocations.reduce((s: number, a: any) => s + Number(a.percentage), 0)
  if (Math.abs(total - 100) > 0.01) return res.status(400).json({ error: 'Allocations must sum to 100%' })
  await prisma.allocation.deleteMany({ where: { accountId: account.id } })
  await prisma.allocation.createMany({
    data: allocations.map((a: any) => ({ accountId: account.id, assetClass: a.assetClass, percentage: new Decimal(a.percentage) })),
  })
  return res.json({ message: 'Allocations updated' })
}

export async function getReconciliation(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const account = await prisma.account.findFirst({ where: { id: req.params.id, userId } })
  if (!account) return res.status(404).json({ error: 'Account not found' })
  const result = await reconcileBalance(req.params.id)
  return res.json(result)
}
