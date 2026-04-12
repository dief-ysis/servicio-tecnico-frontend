import { createContext, useState, useEffect } from 'react'
import client from '../api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setVerificando(false)
      return
    }
    client.get('/auth/me')
      .then(r => setUsuario(r.data.usuario))
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        setUsuario(null)
      })
      .finally(() => setVerificando(false))
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(userData))
    setUsuario(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  if (verificando) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          background: '#ffcd0d', color: '#000', fontSize: 10,
          fontWeight: 900, padding: '5px 12px', borderRadius: 3,
          letterSpacing: '0.1em'
        }}>
          LIGHT SOLUTION
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}