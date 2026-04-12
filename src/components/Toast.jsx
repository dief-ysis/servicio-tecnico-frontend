import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const config = {
    success: { bg: '#000',     color: '#ffcd0d', border: '#222'    },
    error:   { bg: '#8a0000',  color: '#fff',    border: '#b20000' },
    info:    { bg: '#1a4f8a',  color: '#fff',    border: '#2a6faa' },
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999
      }}>
        {toasts.map(({ id, message, type }) => {
          const { bg, color, border } = config[type] ?? config.success
          return (
            <div key={id} style={{
              background: bg, color, border: `1px solid ${border}`,
              borderRadius: 4, padding: '11px 18px',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
              minWidth: 220, maxWidth: 340,
              animation: 'slideIn 0.2s ease',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 14 }}>
                {type === 'success' ? '✓' : type === 'error' ? '✕' : 'i'}
              </span>
              {message}
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)