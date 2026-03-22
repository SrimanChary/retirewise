import React from 'react'
import Navbar from './Navbar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />
      <main style={{ marginLeft: 220, flex: 1, padding: 32, maxWidth: 1200, width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
