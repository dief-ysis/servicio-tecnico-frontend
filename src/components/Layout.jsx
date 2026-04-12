import Sidebar from './Sidebar'
import BuscadorGlobal from './BuscadorGlobal'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: '#fff' }}>
        <header style={{
          height: 52, background: '#fff', borderBottom: '1px solid #e8e8e8',
          display: 'flex', alignItems: 'center', padding: '0 36px',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <BuscadorGlobal />
        </header>
        <main style={{ padding: '32px 36px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}