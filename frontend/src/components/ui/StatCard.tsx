import React from 'react'

interface Props {
  label: string
  value: string
  sub?: string
  color?: string
}

export default function StatCard({ label, value, sub, color = '#4f46e5' }: Props) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e2e8f0', flex: 1 }}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>}
    </div>
  )
}
