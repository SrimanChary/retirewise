import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { getRetirementAdvice } from '../services/ai.service'
import { logger } from '../utils/logger'

export async function getAdvice(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const { age, retirementAge, salary } = req.body
  try {
    const accounts = await prisma.account.findMany({ where: { userId } })
    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)
    const advice = await getRetirementAdvice({
      currentBalance: totalBalance,
      monthlyContribution: Number(req.body.monthlyContribution) || 500,
      age: Number(age) || 35,
      retirementAge: Number(retirementAge) || 65,
      salary: Number(salary) || 80000,
      accounts: accounts.map((a) => a.type),
    })
    return res.json({ advice })
  } catch (err) {
    logger.error('AI advice error', { err })
    return res.status(500).json({ error: 'Could not generate advice' })
  }
}
