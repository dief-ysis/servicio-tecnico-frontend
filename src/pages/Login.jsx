import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      login(data.token, data.usuario)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px'
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{
          background: 'var(--white)', borderRadius: 6,
          padding: '10px 24px', display: 'inline-block'
        }}>
          <img
            src="/logo.png"
            alt="Light Solution"
            style={{ height: isMobile ? 44 : 52, objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        padding: isMobile ? '28px 20px' : '36px 36px 32px',
        width: '100%', maxWidth: 380
      }}>
        <div style={{
          fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center',
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 28
        }}>
          Servicio Técnico — Acceso interno
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              color: 'var(--text-secondary)', fontSize: 10, display: 'block',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800
            }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              required autoFocus
              style={{
                width: '100%', background: 'var(--input-bg)',
                border: '1px solid var(--input-border)', borderRadius: 4,
                padding: '11px 12px', color: 'var(--text-1)', fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              color: 'var(--text-secondary)', fontSize: 10, display: 'block',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800
            }}>Contraseña</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', background: 'var(--input-bg)',
                border: '1px solid var(--input-border)', borderRadius: 4,
                padding: '11px 12px', color: 'var(--text-1)', fontSize: 14, outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: 12,
              padding: '10px 12px', borderRadius: 4, marginBottom: 16,
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: 'var(--primary)', color: 'var(--black)',
            border: 'none', borderRadius: 4, padding: '13px',
            fontSize: 12, fontWeight: 900, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  )
}