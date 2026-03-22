import React, { useState } from 'react'
import Layout from '../components/layout/Layout'
import { advisorApi } from '../api/client'
import { Brain, Send } from 'lucide-react'

export default function Advisor() {
  const [form, setForm] = useState({ age: 32, retirementAge: 65, salary: 90000, monthlyContribution: 500 })
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [asked, setAsked] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }))
  }

  const getAdvice = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setAdvice(''); setAsked(true)
    try {
      const r = await advisorApi.getAdvice(form)
      setAdvice(r.data.advice)
    } catch {
      setAdvice('Unable to generate advice right now. Make sure your backend is running and OPENAI_API_KEY is set in backend/.env')
    } finally { setLoading(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={28} color="#4f46e5" /> AI Retirement Advisor
        </h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Powered by GPT-4o-mini - personalized retirement guidance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Your Profile</h3>
          <form onSubmit={getAdvice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={lbl}>Your age</label><input style={inp} type="number" name="age" value={form.age} onChange={handleChange} min="18" max="80" /></div>
            <div><label style={lbl}>Target retirement age</label><input style={inp} type="number" name="retirementAge" value={form.retirementAge} onChange={handleChange} min="40" max="90" /></div>
            <div><label style={lbl}>Annual salary ($)</label><input style={inp} type="number" name="salary" value={form.salary} onChange={handleChange} min="0" /></div>
            <div><label style={lbl}>Monthly contribution ($)</label><input style={inp} type="number" name="monthlyContribution" value={form.monthlyContribution} onChange={handleChange} min="0" /></div>
            <button type="submit" disabled={loading} style={{ padding: '11px 0', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <Send size={16} />
              {loading ? 'Thinking...' : 'Get AI Advice'}
            </button>
          </form>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, lineHeight: 1.5 }}>
            For educational purposes only. Not financial advice. Consult a licensed CFP for personalized guidance.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 32, border: '1px solid #e2e8f0', minHeight: 300 }}>
          {!asked && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
              <p style={{ color: '#94a3b8', fontSize: 15 }}>Fill in your profile and click Get AI Advice to receive personalized retirement guidance</p>
            </div>
          )}
          {loading && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>💭</div>
              <p style={{ color: '#64748b' }}>Analyzing your retirement profile...</p>
            </div>
          )}
          {advice && !loading && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={22} color="#4f46e5" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>Personalized Advice</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Based on your profile</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 24, lineHeight: 1.8, fontSize: 15, color: '#334155', whiteSpace: 'pre-wrap' }}>
                {advice}
              </div>
              <div style={{ marginTop: 16, padding: '10px 14px', background: '#fef9c3', borderRadius: 8, fontSize: 12, color: '#854d0e' }}>
                Educational purposes only. This is not financial advice.
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
