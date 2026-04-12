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
      minHeight: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px'
    }}>
      {/* Logo en login */}
      <div style={{
        background: '#fff', borderRadius: 6,
        padding: '12px 24px', marginBottom: 32,
        display: 'inline-block'
      }}>
        <img
          src="/logo.png"
          alt="Light Solution"
          style={{ height: 48, objectFit: 'contain', display: 'block' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>

      <div style={{
        background: '#111', border: '0.5px solid #2a2a2a',
        borderRadius: 10, padding: isMobile ? '28px 20px' : '40px 36px',
        width: '100%', maxWidth: 380
      }}>
        <div style={{
          fontSize: 10, color: '#555', textAlign: 'center',
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 28
        }}>
          Servicio Técnico — Acceso interno
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              color: '#666', fontSize: 10, display: 'block',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800
            }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              required autoFocus
              style={{
                width: '100%', background: '#1a1a1a',
                border: '1px solid #333', borderRadius: 4,
                padding: '11px 12px', color: '#fff', fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              color: '#666', fontSize: 10, display: 'block',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800
            }}>Contraseña</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', background: '#1a1a1a',
                border: '1px solid #333', borderRadius: 4,
                padding: '11px 12px', color: '#fff', fontSize: 14, outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fce8e8', color: '#8a0000', fontSize: 12,
              padding: '10px 12px', borderRadius: 4, marginBottom: 16,
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#ffcd0d', color: '#000',
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