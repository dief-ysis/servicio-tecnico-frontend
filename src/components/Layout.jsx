import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import BuscadorGlobal from './BuscadorGlobal'
import { useIsMobile } from '../hooks/useIsMobile'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Layout({ children }) {
  const { isMobile } = useIsMobile()
  const [dark, setDark] = useDarkMode()

  return (
    <div style={{ display: 'flex' }}>
      {!isMobile && <Sidebar />}
      <div style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff'
      }}>
        <header style={{
          height: 52, background: '#000', borderBottom: '1px solid #1f1f1f',
          display: 'flex', alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 36px',
          position: 'sticky', top: 0, zIndex: 50,
          justifyContent: 'space-between'
        }}>
          {isMobile && (
            <div style={{
              background: '#ffcd0d', color: '#000', fontSize: 9,
              fontWeight: 900, padding: '4px 8px', borderRadius: 3,
              letterSpacing: '0.1em'
            }}>
              LIGHT SOLUTION
            </div>
          )}
          <BuscadorGlobal />
          <button onClick={() => setDark(d => !d)} style={{
            background: 'none', border: '1px solid #333',
            borderRadius: 4, padding: '5px 10px',
            color: '#aaa', fontSize: 14, cursor: 'pointer',
            marginLeft: 12, flexShrink: 0
          }} title={dark ? 'Modo claro' : 'Modo oscuro'}>
            {dark ? '☀' : '☾'}
          </button>
        </header>
        <main style={{
          flex: 1,
          padding: isMobile ? '20px 16px 16px' : '32px 36px'
        }}>
          {children}
        </main>
        <footer style={{
          textAlign: 'center',
          marginTop: 16,
          padding: isMobile ? '0 16px 16px' : '0 36px 24px'
        }}>
          <Link to="/privacidad" style={{
            fontSize: 10,
            color: '#555',
            textDecoration: 'none',
            letterSpacing: '0.06em'
          }}>
            Política de privacidad · Ley 19.628
          </Link>
        </footer>
      </div>
      {isMobile && <Sidebar />}
    </div>
  )
}