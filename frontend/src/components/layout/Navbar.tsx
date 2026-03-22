import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { BarChart3, Home, CreditCard, TrendingUp, Brain, LogOut } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/accounts', label: 'Accounts', icon: CreditCard },
  { to: '/simulator', label: 'Simulator', icon: TrendingUp },
  { to: '/advisor', label: 'AI Advisor', icon: Brain },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav style={{ background: '#1e293b', height: '100vh', width: 220, display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', left: 0, top: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <BarChart3 size={28} color="#6366f1" />
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>RetireWise</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, textDecoration: 'none', background: active ? '#4f46e5' : 'transparent', color: active ? '#fff' : '#94a3b8', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#334155' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={18} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            </Link>
          )
        })}
      </div>
      <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
        <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12, paddingLeft: 14 }}>
          <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{user?.name}</div>
          <div style={{ fontSize: 12 }}>{user?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', width: '100%', fontSize: 14 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#334155')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
