import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useIsMobile } from '../hooks/useIsMobile'

const links = [
  { to: '/',         label: 'Dashboard',  icon: '▦' },
  { to: '/equipos',  label: 'Equipos',    icon: '⊞' },
  { to: '/clientes', label: 'Clientes',   icon: '◉' },
  { to: '/usuarios', label: 'Usuarios',   icon: '◈' },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = usuario?.nombre
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#000', borderTop: '1px solid #1f1f1f',
        display: 'flex', zIndex: 200, height: 58
      }}>
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 3,
            color: isActive ? '#ffcd0d' : '#555',
            fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
            textDecoration: 'none', padding: '6px 0',
            borderTop: isActive ? '2px solid #ffcd0d' : '2px solid transparent',
          })}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label.toUpperCase()}
          </NavLink>
        ))}
        <button onClick={handleLogout} style={{
          flex: 0.6, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          background: 'none', border: 'none', borderTop: '2px solid transparent',
          color: '#555', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: 16 }}>×</span>
          SALIR
        </button>
      </nav>
    )
  }

  return (
    <aside style={{
      width: 220, background: '#000', display: 'flex',
      flexDirection: 'column', height: '100vh',
      position: 'fixed', left: 0, top: 0, zIndex: 100
    }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{
          background: '#fff', borderRadius: 5,
          padding: '6px 10px', display: 'inline-block', marginBottom: 6
        }}>
          <img
            src="/logo.png"
            alt="Light Solution"
            style={{ height: 28, objectFit: 'contain', display: 'block' }}
          />
        </div>
        <div style={{
          color: '#555', fontSize: 9, marginTop: 4,
          letterSpacing: '0.08em', textTransform: 'uppercase'
        }}>
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
            textDecoration: 'none'
          })}>
            {label.toUpperCase()}
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