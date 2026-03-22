import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { accountApi, portfolioApi } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/layout/Layout'
import StatCard from '../components/ui/StatCard'
import AllocationChart from '../components/charts/AllocationChart'
import { Account, PortfolioSummary } from '../types'
import { formatCurrency, accountTypeLabel } from '../utils'
import { PlusCircle, ArrowRight, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([accountApi.list(), portfolioApi.summary()])
      .then(([accRes, sumRes]) => {
        setAccounts(accRes.data.accounts)
        setSummary(sumRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: '#64748b', fontSize: 16 }}>Loading your portfolio...</div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 15 }}>Here is your retirement portfolio overview</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Total Portfolio Value" value={formatCurrency(summary?.totalBalance || 0)} sub="Across all accounts" color="#4f46e5" />
        <StatCard label="Accounts" value={String(accounts.length)} sub="Active retirement accounts" color="#0ea5e9" />
        <StatCard label="Monthly Goal" value="$500" sub="Avg monthly contribution" color="#10b981" />
        <StatCard label="On Track" value="85%" sub="Toward retirement goal" color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <AllocationChart allocations={summary?.allocations || []} />

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/accounts', label: 'View all accounts', icon: '🏦', color: '#ede9fe' },
              { to: '/simulator', label: 'Run projection simulator', icon: '📈', color: '#dcfce7' },
              { to: '/advisor', label: 'Get AI retirement advice', icon: '🤖', color: '#e0f2fe' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, background: item.color, textDecoration: 'none' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b', flex: 1 }}>{item.label}</span>
                <ArrowRight size={16} color="#64748b" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Your Accounts</h3>
          <Link to="/accounts" style={{ fontSize: 13, color: '#4f46e5', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            Manage <ArrowRight size={14} />
          </Link>
        </div>
        {accounts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', marginBottom: 16 }}>No accounts yet</p>
            <Link to="/accounts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <PlusCircle size={16} /> Add Account
            </Link>
          </div>
        ) : accounts.map((acc, i) => (
          <div key={acc.id} style={{ padding: '16px 24px', borderBottom: i < accounts.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏦</div>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{acc.name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{accountTypeLabel[acc.type]}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#1e293b' }}>{formatCurrency(Number(acc.balance))}</div>
              <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                <TrendingUp size={11} /> Active
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
