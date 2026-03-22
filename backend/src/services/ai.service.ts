import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function getRetirementAdvice(params: {
  currentBalance: number; monthlyContribution: number; age: number
  retirementAge: number; salary: number; accounts: string[]
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-key-here') {
    return `Based on your profile: At age ${params.age} with $${params.currentBalance.toLocaleString()} saved and contributing $${params.monthlyContribution}/month, you're on a solid path. Consider increasing contributions by 1% annually, ensure you're getting your full employer match, and maintain a diversified portfolio appropriate for your ${params.retirementAge - params.age} year timeline. At your current rate you could retire comfortably at age ${params.retirementAge}.`
  }
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a certified financial planner specializing in retirement planning. Give concise, actionable advice in 2-3 paragraphs.' },
      { role: 'user', content: `My retirement profile: Age ${params.age}, target retirement at ${params.retirementAge}. Current balance: $${params.currentBalance.toLocaleString()}. Monthly contribution: $${params.monthlyContribution}. Annual salary: $${params.salary.toLocaleString()}. Account types: ${params.accounts.join(', ')}. What should I focus on?` },
    ],
    max_tokens: 400,
  })
  return completion.choices[0].message.content || 'Unable to generate advice at this time.'
}
