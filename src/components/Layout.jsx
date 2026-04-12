import Sidebar from './Sidebar'
import BuscadorGlobal from './BuscadorGlobal'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Layout({ children }) {
  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex' }}>
      {!isMobile && <Sidebar />}
      <div style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1, minHeight: '100vh', background: '#fff'
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
        </header>
        <main style={{
          padding: isMobile ? '20px 16px 76px' : '32px 36px'
        }}>
          {children}
        </main>
      </div>
      {isMobile && <Sidebar />}
    </div>
  )
}