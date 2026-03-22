import React, { useState } from 'react'
import Layout from '../components/layout/Layout'
import ProjectionChart from '../components/charts/ProjectionChart'
import { portfolioApi } from '../api/client'
import { ProjectionResult } from '../types'
import { formatCurrency } from '../utils'

export default function Simulator() {
  const [form, setForm] = useState({ currentBalance: 85000, monthlyContribution: 500, annualReturnRate: 7, currentAge: 32, retirementAge: 65 })
  const [result, setResult] = useState<ProjectionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }))
  }

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await portfolioApi.projection({ ...form, annualReturnRate: form.annualReturnRate / 100 })
      setResult(r.data)
    } finally { setLoading(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Retirement Simulator</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Project your retirement balance using compound interest</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Your Parameters</h3>
          <form onSubmit={calculate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={lbl}>Current balance ($)</label><input style={inp} type="number" name="currentBalance" value={form.currentBalance} onChange={handleChange} min="0" /></div>
            <div><label style={lbl}>Monthly contribution ($)</label><input style={inp} type="number" name="monthlyContribution" value={form.monthlyContribution} onChange={handleChange} min="0" /></div>
            <div>
              <label style={lbl}>Expected annual return (%)</label>
              <input style={inp} type="number" name="annualReturnRate" value={form.annualReturnRate} onChange={handleChange} min="0" max="30" step="0.1" />
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Historical S&P 500 avg: ~10% nominal, ~7% real</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Current age</label><input style={inp} type="number" name="currentAge" value={form.currentAge} onChange={handleChange} min="18" max="80" /></div>
              <div><label style={lbl}>Retirement age</label><input style={inp} type="number" name="retirementAge" value={form.retirementAge} onChange={handleChange} min="40" max="90" /></div>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '11px 0', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
              {loading ? 'Calculating...' : 'Calculate Projection'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {result ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  { label: 'Projected Balance', value: formatCurrency(result.finalBalance), color: '#4f46e5', sub: 'At retirement' },
                  { label: 'Inflation-Adjusted', value: formatCurrency(result.finalRealBalance), color: '#0ea5e9', sub: "In today's dollars" },
                  { label: 'Est. Monthly Income', value: formatCurrency(result.monthlyIncomeEstimate), color: '#10b981', sub: '4% withdrawal rule' },
                  { label: 'Your Contributions', value: formatCurrency(result.totalContributions), color: '#f59e0b', sub: 'Total deposited' },
                  { label: 'Investment Growth', value: formatCurrency(result.totalGrowth), color: '#8b5cf6', sub: 'Returns earned' },
                  { label: 'Years to Retire', value: `${form.retirementAge - form.currentAge} yrs`, color: '#ec4899', sub: `Age ${form.currentAge} to ${form.retirementAge}` },
                ].map(card => (
                  <div key={card.label} style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{card.sub}</div>
                  </div>
                ))}
              </div>
              <ProjectionChart data={result.dataPoints} />
            </>
          ) : (
            <div style={{ background: '#fff', borderRadius: 12, padding: 60, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
              <p style={{ color: '#94a3b8', fontSize: 15 }}>Fill in your parameters and click Calculate to see your retirement projection</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
