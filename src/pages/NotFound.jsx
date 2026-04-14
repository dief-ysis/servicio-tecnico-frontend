import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--primary)', color: 'var(--black)', fontSize: 10,
        fontWeight: 900, padding: '5px 12px', borderRadius: 3,
        letterSpacing: '0.1em', marginBottom: 28
      }}>LIGHT SOLUTION</div>

      <div style={{
        fontSize: 96, fontWeight: 900, color: 'var(--primary)',
        lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 8
      }}>404</div>

      <div style={{
        fontSize: 11, fontWeight: 900, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 32
      }}>Página no encontrada</div>

      <button onClick={() => navigate('/')} style={{
        background: 'var(--primary)', border: 'none', borderRadius: 4,
        padding: '11px 28px', fontSize: 11, fontWeight: 900,
        letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer'
      }}>
        Volver al dashboard
      </button>
    </div>
  )
}