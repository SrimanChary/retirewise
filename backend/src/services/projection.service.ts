export interface ProjectionInput {
  currentBalance: number
  monthlyContribution: number
  annualReturnRate: number
  currentAge: number
  retirementAge: number
  inflationRate?: number
}
export interface DataPoint { age: number; year: number; balance: number; realBalance: number; totalContributions: number }
export interface ProjectionResult { dataPoints: DataPoint[]; finalBalance: number; finalRealBalance: number; totalContributions: number; totalGrowth: number; monthlyIncomeEstimate: number }

export function calculateProjection(input: ProjectionInput): ProjectionResult {
  const { currentBalance, monthlyContribution, annualReturnRate, currentAge, retirementAge, inflationRate = 0.025 } = input
  const monthlyRate = annualReturnRate / 12
  const totalMonths = (retirementAge - currentAge) * 12
  const startYear = new Date().getFullYear()
  const dataPoints: DataPoint[] = []
  let balance = currentBalance, totalContributions = currentBalance
  for (let month = 0; month <= totalMonths; month++) {
    if (month > 0) { balance = balance * (1 + monthlyRate) + monthlyContribution; totalContributions += monthlyContribution }
    if (month % 12 === 0) {
      const years = month / 12
      dataPoints.push({ age: Math.round(currentAge + years), year: Math.round(startYear + years), balance: Math.round(balance), realBalance: Math.round(balance / Math.pow(1 + inflationRate, years)), totalContributions: Math.round(totalContributions) })
    }
  }
  const years = retirementAge - currentAge
  return { dataPoints, finalBalance: Math.round(balance), finalRealBalance: Math.round(balance / Math.pow(1 + inflationRate, years)), totalContributions: Math.round(totalContributions), totalGrowth: Math.round(balance - totalContributions), monthlyIncomeEstimate: Math.round((balance * 0.04) / 12) }
}
