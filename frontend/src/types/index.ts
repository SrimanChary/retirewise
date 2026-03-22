export interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADVISOR' | 'ADMIN'
  createdAt: string
}

export type AccountType = 'RETIREMENT_401K' | 'IRA_TRADITIONAL' | 'IRA_ROTH' | 'BROKERAGE'
export type TransactionType = 'CONTRIBUTION' | 'WITHDRAWAL' | 'REBALANCE' | 'FEE' | 'DIVIDEND'
export type TransactionStatus = 'PENDING' | 'SETTLED' | 'FAILED' | 'REVERSED'

export interface Allocation {
  assetClass: string
  percentage: number
}

export interface Account {
  id: string
  userId: string
  type: AccountType
  name: string
  balance: number
  createdAt: string
  updatedAt: string
  allocations: Allocation[]
  _count?: { transactions: number }
}

export interface Transaction {
  id: string
  accountId: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  description?: string
  createdAt: string
  settledAt?: string
}

export interface PortfolioSummary {
  totalBalance: number
  accountCount: number
  allocations: Array<{ assetClass: string; value: number; percentage: number }>
}

export interface DataPoint {
  age: number
  year: number
  balance: number
  realBalance: number
  totalContributions: number
}

export interface ProjectionResult {
  dataPoints: DataPoint[]
  finalBalance: number
  finalRealBalance: number
  totalContributions: number
  totalGrowth: number
  monthlyIncomeEstimate: number
}
