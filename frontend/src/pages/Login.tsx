import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BarChart3 } from 'lucide-react'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@retirewise.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!name) { setError('Name is required'); setLoading(false); return }
        await register(email, password, name)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 400, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <BarChart3 size={32} color="#4f46e5" />
            <span style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>RetireWise</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {mode === 'login' && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#0369a1' }}>
            <strong>Demo:</strong> demo@retirewise.com / password123
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div>
              <label style={lbl}>Full name</label>
              <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" />
            </div>
          )}
          <div>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '11px 0', borderRadius: 8, background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 24 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
