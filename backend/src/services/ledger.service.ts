import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'

export async function processContribution(
  accountId: string, transactionId: string, amount: number, description: string
) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findUniqueOrThrow({ where: { id: accountId } })
    const newBalance = Number(account.balance) + amount
    await tx.ledgerEntry.create({
      data: { accountId, transactionId, type: 'CREDIT', amount: new Decimal(amount), balanceAfter: new Decimal(newBalance), description },
    })
    await tx.account.update({ where: { id: accountId }, data: { balance: new Decimal(newBalance) } })
    await tx.transaction.update({ where: { id: transactionId }, data: { status: 'SETTLED', settledAt: new Date() } })
    logger.info('Contribution processed', { accountId, amount, newBalance })
    return { newBalance }
  })
}

export async function processWithdrawal(
  accountId: string, transactionId: string, amount: number, description: string
) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findUniqueOrThrow({ where: { id: accountId } })
    const currentBalance = Number(account.balance)
    if (currentBalance < amount)
      throw new Error(`Insufficient funds. Balance: $${currentBalance.toFixed(2)}, Requested: $${amount.toFixed(2)}`)
    const newBalance = currentBalance - amount
    await tx.ledgerEntry.create({
      data: { accountId, transactionId, type: 'DEBIT', amount: new Decimal(amount), balanceAfter: new Decimal(newBalance), description },
    })
    await tx.account.update({ where: { id: accountId }, data: { balance: new Decimal(newBalance) } })
    await tx.transaction.update({ where: { id: transactionId }, data: { status: 'SETTLED', settledAt: new Date() } })
    logger.info('Withdrawal processed', { accountId, amount, newBalance })
    return { newBalance }
  })
}

export async function reconcileBalance(accountId: string) {
  const [account, entries] = await Promise.all([
    prisma.account.findUniqueOrThrow({ where: { id: accountId } }),
    prisma.ledgerEntry.findMany({ where: { accountId }, orderBy: { createdAt: 'asc' } }),
  ])
  let derived = 0
  for (const e of entries) derived += e.type === 'CREDIT' ? Number(e.amount) : -Number(e.amount)
  const stored = Number(account.balance)
  const ok = Math.abs(stored - derived) < 0.01
  if (!ok) logger.warn('Reconciliation mismatch', { accountId, stored, derived })
  return { storedBalance: stored, derivedBalance: derived, isReconciled: ok }
}
