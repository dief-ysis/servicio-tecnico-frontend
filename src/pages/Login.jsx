import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#111', border: '0.5px solid #2a2a2a',
        borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 380
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            background: '#ffcd0d', color: '#000', fontSize: 13,
            fontWeight: 800, padding: '6px 14px', borderRadius: 6,
            display: 'inline-block', letterSpacing: '0.06em', marginBottom: 10
          }}>
            LIGHT SOLUTION
          </div>
          <div style={{ color: '#888', fontSize: 13 }}>Servicio Técnico</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
              style={{
                width: '100%', background: '#1a1a1a', border: '0.5px solid #333',
                borderRadius: 6, padding: '10px 12px', color: '#fff', fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', background: '#1a1a1a', border: '0.5px solid #333',
                borderRadius: 6, padding: '10px 12px', color: '#fff', fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fce8e8', color: '#8a0000', fontSize: 13,
              padding: '10px 12px', borderRadius: 6, marginBottom: 16
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