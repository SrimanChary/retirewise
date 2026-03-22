import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { calculateProjection } from '../services/projection.service'

export async function getPortfolioSummary(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: { allocations: true },
  })
  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)
  const allocationMap: Record<string, number> = {}
  for (const account of accounts) {
    for (const alloc of account.allocations) {
      const value = (Number(alloc.percentage) / 100) * Number(account.balance)
      allocationMap[alloc.assetClass] = (allocationMap[alloc.assetClass] || 0) + value
    }
  }
  const allocations = Object.entries(allocationMap).map(([assetClass, value]) => ({
    assetClass, value: Math.round(value), percentage: totalBalance > 0 ? Math.round((value / totalBalance) * 100) : 0,
  }))
  return res.json({ totalBalance, accountCount: accounts.length, allocations })
}

export async function getProjection(req: Request, res: Response) {
  const { currentBalance, monthlyContribution, annualReturnRate, currentAge, retirementAge } = req.body
  if (!currentBalance || !monthlyContribution || !annualReturnRate || !currentAge || !retirementAge)
    return res.status(400).json({ error: 'All projection fields required' })
  const result = calculateProjection({ currentBalance: Number(currentBalance), monthlyContribution: Number(monthlyContribution), annualReturnRate: Number(annualReturnRate), currentAge: Number(currentAge), retirementAge: Number(retirementAge) })
  return res.json(result)
}
