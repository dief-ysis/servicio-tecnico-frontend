import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#ffcd0d', color: '#000', fontSize: 10,
        fontWeight: 900, padding: '5px 12px', borderRadius: 3,
        letterSpacing: '0.1em', marginBottom: 28
      }}>LIGHT SOLUTION</div>

      <div style={{
        fontSize: 96, fontWeight: 900, color: '#ffcd0d',
        lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 8
      }}>404</div>

      <div style={{
        fontSize: 11, fontWeight: 900, color: '#555',
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 32
      }}>Página no encontrada</div>

      <button onClick={() => navigate('/')} style={{
        background: '#ffcd0d', border: 'none', borderRadius: 4,
        padding: '11px 28px', fontSize: 11, fontWeight: 900,
        letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer'
      }}>
        Volver al dashboard
      </button>
    </div>
  )
}