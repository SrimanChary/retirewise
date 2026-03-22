import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@retirewise.com' },
    update: {},
    create: {
      email: 'demo@retirewise.com',
      passwordHash: hash,
      name: 'Alex Johnson',
      role: 'USER',
    },
  })

  const account401k = await prisma.account.create({
    data: {
      userId: user.id,
      type: 'RETIREMENT_401K',
      name: 'My 401(k)',
      balance: 85000,
    },
  })

  const accountIRA = await prisma.account.create({
    data: {
      userId: user.id,
      type: 'IRA_ROTH',
      name: 'Roth IRA',
      balance: 32000,
    },
  })

  // Seed allocations for 401k
  await prisma.allocation.createMany({
    data: [
      { accountId: account401k.id, assetClass: 'US_STOCKS', percentage: 60 },
      { accountId: account401k.id, assetClass: 'INTERNATIONAL', percentage: 20 },
      { accountId: account401k.id, assetClass: 'BONDS', percentage: 15 },
      { accountId: account401k.id, assetClass: 'CASH', percentage: 5 },
    ],
  })

  // Seed allocations for IRA
  await prisma.allocation.createMany({
    data: [
      { accountId: accountIRA.id, assetClass: 'US_STOCKS', percentage: 75 },
      { accountId: accountIRA.id, assetClass: 'INTERNATIONAL', percentage: 15 },
      { accountId: accountIRA.id, assetClass: 'BONDS', percentage: 10 },
    ],
  })

  // Seed some transactions + ledger entries
  const tx1 = await prisma.transaction.create({
    data: {
      accountId: account401k.id,
      type: 'CONTRIBUTION',
      amount: 2000,
      status: 'SETTLED',
      description: 'January contribution',
      settledAt: new Date(),
    },
  })
  await prisma.ledgerEntry.create({
    data: {
      accountId: account401k.id,
      transactionId: tx1.id,
      type: 'CREDIT',
      amount: 2000,
      balanceAfter: 85000,
      description: 'January contribution',
    },
  })

  const tx2 = await prisma.transaction.create({
    data: {
      accountId: accountIRA.id,
      type: 'CONTRIBUTION',
      amount: 500,
      status: 'SETTLED',
      description: 'Monthly IRA contribution',
      settledAt: new Date(),
    },
  })
  await prisma.ledgerEntry.create({
    data: {
      accountId: accountIRA.id,
      transactionId: tx2.id,
      type: 'CREDIT',
      amount: 500,
      balanceAfter: 32000,
      description: 'Monthly IRA contribution',
    },
  })

  console.log('Seed complete!')
  console.log('Login: demo@retirewise.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
