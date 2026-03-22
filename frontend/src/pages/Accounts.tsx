import React, { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import { accountApi, transactionApi } from '../api/client'
import { Account, Transaction } from '../types'
import { formatCurrency, accountTypeLabel, txTypeColor } from '../utils'
import { PlusCircle, X, RefreshCw } from 'lucide-react'

const ACCOUNT_TYPES = ['RETIREMENT_401K', 'IRA_TRADITIONAL', 'IRA_ROTH', 'BROKERAGE'] as const

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selected, setSelected] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showTx, setShowTx] = useState(false)
  const [reconcile, setReconcile] = useState<any>(null)
  const [newType, setNewType] = useState('RETIREMENT_401K')
  const [newName, setNewName] = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [txType, setTxType] = useState('CONTRIBUTION')
  const [txAmount, setTxAmount] = useState('')
  const [txDesc, setTxDesc] = useState('')
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState('')

  useEffect(() => {
    accountApi.list().then(r => setAccounts(r.data.accounts)).finally(() => setLoading(false))
  }, [])

  const loadTransactions = async (acc: Account) => {
    setSelected(acc)
    setTransactions([])
    setReconcile(null)
    const r = await transactionApi.list(acc.id, { limit: 20 })
    setTransactions(r.data.transactions)
  }

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = await accountApi.create({ type: newType, name: newName, initialBalance: Number(newBalance) || 0 })
    setAccounts(prev => [...prev, r.data])
    setShowCreate(false); setNewName(''); setNewBalance('')
  }

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setTxError(''); setTxLoading(true)
    try {
      const idempotencyKey = `${selected.id}-${txType}-${Date.now()}`
      const r = await transactionApi.create(selected.id, { type: txType, amount: Number(txAmount), description: txDesc, idempotencyKey })
      const newBal = r.data.newBalance
      setSelected(prev => prev ? { ...prev, balance: newBal } : prev)
      setAccounts(prev => prev.map(a => a.id === selected.id ? { ...a, balance: newBal } : a))
      const txR = await transactionApi.list(selected.id, { limit: 20 })
      setTransactions(txR.data.transactions)
      setShowTx(false); setTxAmount(''); setTxDesc('')
    } catch (err: any) {
      setTxError(err.response?.data?.error || 'Transaction failed')
    } finally { setTxLoading(false) }
  }

  const runReconcile = async (acc: Account) => {
    const r = await accountApi.reconcile(acc.id)
    setReconcile(r.data)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
  const btnP: React.CSSProperties = { padding: '9px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }
  const btnS: React.CSSProperties = { padding: '9px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Accounts</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Manage your retirement accounts</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ ...btnP, display: 'flex', alignItems: 'center', gap: 6 }}>
          <PlusCircle size={16} /> New Account
        </button>
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 420, position: 'relative' }}>
            <button onClick={() => setShowCreate(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Add Account</h2>
            <form onSubmit={createAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Account type</label>
                <select style={inp} value={newType} onChange={e => setNewType(e.target.value)}>
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{accountTypeLabel[t]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Account name</label>
                <input style={inp} value={newName} onChange={e => setNewName(e.target.value)} placeholder="My 401(k)" required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Starting balance ($)</label>
                <input style={inp} type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="0" min="0" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ ...btnS, flex: 1 }}>Cancel</button>
                <button type="submit" style={{ ...btnP, flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#64748b' }}>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '340px 1fr' : '1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {accounts.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>No accounts yet. Create one above.</p>}
            {accounts.map(acc => (
              <div key={acc.id} onClick={() => loadTransactions(acc)} style={{ background: '#fff', borderRadius: 12, padding: 20, border: `2px solid ${selected?.id === acc.id ? '#4f46e5' : '#e2e8f0'}`, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{acc.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{accountTypeLabel[acc.type]}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b' }}>{formatCurrency(Number(acc.balance))}</div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{selected.name}</h2>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{accountTypeLabel[selected.type]}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#4f46e5' }}>{formatCurrency(Number(selected.balance))}</div>
                    <div style={{ fontSize: 12, color: '#10b981' }}>Current balance</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setShowTx(true); setTxError('') }} style={btnP}>Add Transaction</button>
                  <button onClick={() => runReconcile(selected)} style={{ ...btnS, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={14} /> Reconcile
                  </button>
                </div>
                {reconcile && (
                  <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: reconcile.isReconciled ? '#f0fdf4' : '#fef2f2', border: `1px solid ${reconcile.isReconciled ? '#bbf7d0' : '#fecaca'}` }}>
                    <strong style={{ fontSize: 13, color: reconcile.isReconciled ? '#15803d' : '#dc2626' }}>
                      {reconcile.isReconciled ? 'Balance reconciled' : 'Reconciliation mismatch!'}
                    </strong>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      Stored: {formatCurrency(reconcile.storedBalance)} · Derived: {formatCurrency(reconcile.derivedBalance)}
                    </div>
                  </div>
                )}
              </div>

              {showTx && (
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>New Transaction</h3>
                    <button onClick={() => setShowTx(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#94a3b8" /></button>
                  </div>
                  {txError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#dc2626' }}>{txError}</div>}
                  <form onSubmit={submitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Type</label>
                        <select style={inp} value={txType} onChange={e => setTxType(e.target.value)}>
                          {['CONTRIBUTION', 'WITHDRAWAL', 'DIVIDEND', 'FEE'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Amount ($)</label>
                        <input style={inp} type="number" min="0.01" step="0.01" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="500.00" required />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 6 }}>Description (optional)</label>
                      <input style={inp} value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Monthly contribution..." />
                    </div>
                    <button type="submit" disabled={txLoading} style={{ ...btnP, opacity: txLoading ? 0.6 : 1 }}>
                      {txLoading ? 'Processing...' : 'Submit Transaction'}
                    </button>
                  </form>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Transaction History</h3>
                </div>
                {transactions.length === 0 ? (
                  <p style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>No transactions yet</p>
                ) : transactions.map((tx, i) => (
                  <div key={tx.id} style={{ padding: '14px 24px', borderBottom: i < transactions.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${txTypeColor[tx.type]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: txTypeColor[tx.type] }}>
                        {['CONTRIBUTION', 'DIVIDEND'].includes(tx.type) ? '+' : '-'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{tx.type}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{tx.description || '-'} · {new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: txTypeColor[tx.type] || '#1e293b' }}>
                        {['CONTRIBUTION', 'DIVIDEND'].includes(tx.type) ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                      </div>
                      <div style={{ fontSize: 11, color: tx.status === 'SETTLED' ? '#10b981' : '#f59e0b' }}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
