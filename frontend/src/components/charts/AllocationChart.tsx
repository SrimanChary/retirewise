import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { assetClassColor, assetClassLabel, formatCurrency } from '../../utils'

interface Props {
  allocations: Array<{ assetClass: string; value: number; percentage: number }>
}

export default function AllocationChart({ allocations }: Props) {
  const data = allocations.map(a => ({
    name: assetClassLabel[a.assetClass] || a.assetClass,
    value: a.value,
    percentage: a.percentage,
    color: assetClassColor[a.assetClass] || '#6366f1',
  }))

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Portfolio Allocation</h3>
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No allocation data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
            <Legend formatter={(value) => <span style={{ fontSize: 13, color: '#475569' }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
