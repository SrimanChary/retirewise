export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

export const accountTypeLabel: Record<string, string> = {
  RETIREMENT_401K: '401(k)',
  IRA_TRADITIONAL: 'Traditional IRA',
  IRA_ROTH: 'Roth IRA',
  BROKERAGE: 'Brokerage',
}

export const assetClassLabel: Record<string, string> = {
  US_STOCKS: 'US Stocks',
  INTERNATIONAL: 'International',
  BONDS: 'Bonds',
  CASH: 'Cash',
}

export const assetClassColor: Record<string, string> = {
  US_STOCKS: '#4F46E5',
  INTERNATIONAL: '#0EA5E9',
  BONDS: '#10B981',
  CASH: '#F59E0B',
}

export const txTypeColor: Record<string, string> = {
  CONTRIBUTION: '#10B981',
  DIVIDEND: '#10B981',
  WITHDRAWAL: '#EF4444',
  FEE: '#F59E0B',
  REBALANCE: '#6366F1',
}
