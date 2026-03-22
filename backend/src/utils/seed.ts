// backend/src/utils/seed.ts
// Run: npm run db:seed
// Creates a demo user with accounts and transactions for showcasing

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Demo user
  const passwordHash = await bcrypt.hash('demo1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@retirewise.com' },
    update: {},
    create: { email: 'demo@retirewise.com', passwordHash, name: 'Alex Johnson', role: 'USER' },
  })
  console.log('✅ Created user:', user.email)

  // 401k Account
  const account401k = await prisma.account.upsert({
    where: { id: 'seed-401k' },
    update: {},
    create: {
      id: 'seed-401k',
      userId: user.id,
      type: 'RETIREMENT_401K',
      name: 'Company 401(k)',
      balance: 85000,
      allocations: {
        create: [
          { assetClass: 'US_STOCKS', percentage: 60 },
          { assetClass: 'INTERNATIONAL', percentage: 20 },
          { assetClass: 'BONDS', percentage: 15 },
          { assetClass: 'CASH', percentage: 5 },
        ],
      },
    },
  })

  // Roth IRA
  const accountRoth = await prisma.account.upsert({
    where: { id: 'seed-roth' },
    update: {},
    create: {
      id: 'seed-roth',
      userId: user.id,
      type: 'IRA_ROTH',
      name: 'Roth IRA',
      balance: 32000,
      allocations: {
        create: [
          { assetClass: 'US_STOCKS', percentage: 80 },
          { assetClass: 'INTERNATIONAL', percentage: 15 },
          { assetClass: 'BONDS', percentage: 5 },
        ],
      },
    },
  })

  console.log('✅ Created accounts:', account401k.name, accountRoth.name)

  // Sample transactions for 401k
  const txnData = [
    { type: 'CONTRIBUTION', amount: 1500, description: 'Monthly contribution', months: 3 },
    { type: 'DIVIDEND', amount: 450, description: 'Q1 dividend reinvestment', months: 2 },
    { type: 'CONTRIBUTION', amount: 1500, description: 'Monthly contribution', months: 1 },
  ]

  for (const txn of txnData) {
    const date = new Date()
    date.setMonth(date.getMonth() - txn.months)
    await prisma.transaction.create({
      data: {
        accountId: account401k.id,
        type: txn.type as any,
        amount: txn.amount,
        status: 'SETTLED',
        description: txn.description,
        settledAt: date,
        createdAt: date,
        ledgerEntries: {
          create: {
            accountId: account401k.id,
            type: 'CREDIT',
            amount: txn.amount,
            balanceAfter: 85000,
            description: txn.description,
            createdAt: date,
          },
        },
      },
    })
  }

  console.log('✅ Seeded transactions')
  console.log('\n🎉 Done! Login with:')
  console.log('   Email: demo@retirewise.com')
  console.log('   Password: demo1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
