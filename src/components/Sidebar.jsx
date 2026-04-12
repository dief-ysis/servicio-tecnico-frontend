import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/',         label: 'DASHBOARD'  },
  { to: '/equipos',  label: 'EQUIPOS'    },
  { to: '/clientes', label: 'CLIENTES'   },
  { to: '/usuarios', label: 'USUARIOS'   },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = usuario?.nombre
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside style={{
      width: 220, background: '#000', display: 'flex',
      flexDirection: 'column', height: '100vh',
      position: 'fixed', left: 0, top: 0, zIndex: 100
    }}>
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{
          background: '#ffcd0d', color: '#000', fontSize: 10,
          fontWeight: 900, padding: '5px 10px', borderRadius: 3,
          display: 'inline-block', letterSpacing: '0.1em'
        }}>
          LIGHT SOLUTION
        </div>
        <div style={{ color: '#555', fontSize: 10, marginTop: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Servicio Técnico
        </div>
      </div>

      <nav style={{ padding: '10px 10px', flex: 1 }}>
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', padding: '10px 12px',
            borderRadius: 4, fontSize: 11, fontWeight: 800,
            letterSpacing: '0.08em',
            color: isActive ? '#000' : '#555',
            background: isActive ? '#ffcd0d' : 'transparent',
            marginBottom: 2, transition: 'all 0.1s',
            borderLeft: isActive ? 'none' : '2px solid transparent',
          })}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#ffcd0d', color: '#000',
            fontSize: 10, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            letterSpacing: '0.05em', flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#eee', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.nombre}
            </div>
            <div style={{ color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {usuario?.rol}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', color: '#444',
            fontSize: 18, padding: '0 2px', lineHeight: 1, cursor: 'pointer'
          }} title="Cerrar sesión">×</button>
        </div>
      </div>
    </aside>
  )
}