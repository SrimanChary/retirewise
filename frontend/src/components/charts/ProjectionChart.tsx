import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils'
import { DataPoint } from '../../types'

interface Props {
  data: DataPoint[]
}

const fmt = (v: number) => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
  return formatCurrency(v)
}

export default function ProjectionChart({ data }: Props) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Retirement Projection</h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Nominal vs inflation-adjusted growth over time</p>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="contGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="age" tickFormatter={(v) => `Age ${v}`} tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: '#94a3b8' }} width={70} />
          <Tooltip formatter={(value: number) => [formatCurrency(value)]} labelFormatter={(l) => `Age ${l}`} />
          <Legend />
          <Area type="monotone" dataKey="balance" name="Total Balance" stroke="#4f46e5" strokeWidth={2} fill="url(#balGrad)" />
          <Area type="monotone" dataKey="realBalance" name="Inflation-Adjusted" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
          <Area type="monotone" dataKey="totalContributions" name="Your Contributions" stroke="#10b981" strokeWidth={2} fill="url(#contGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
