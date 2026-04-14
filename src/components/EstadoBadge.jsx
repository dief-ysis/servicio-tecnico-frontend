const config = {
  por_reparar:   { label: 'POR REPARAR',   bg: 'var(--warning-bg)',  color: 'var(--warning-text)',  border: '#e6d060' },
  en_reparacion: { label: 'EN REPARACIÓN', bg: 'var(--info-bg)',     color: 'var(--info-text)',     border: '#a0c0e8' },
  espera_repuesto:{ label: 'ESPERA REPUESTO',     bg: '#f5eafd',            color: '#6b2fa0',              border: '#c9a0e8' },
  reparado:      { label: 'REPARADO',      bg: 'var(--success-bg)',  color: 'var(--success-text)',  border: '#a8cc80' },
  irreparable:   { label: 'IRREPARABLE',   bg: 'var(--danger-bg)',   color: 'var(--danger-text)',   border: '#e8a0a0' },
  entregado:     { label: 'ENTREGADO',     bg: 'var(--border-color)',color: 'var(--text-2)',         border: 'var(--border-color)' },
}

export default function EstadoBadge({ estado }) {
  const { label, bg, color, border } = config[estado] ?? {
    label: estado, bg: 'var(--border-color)', color: 'var(--text-2)', border: 'var(--border-color)'
  }
  return (
    <span style={{
      background: bg, color, border: `1px solid ${border}`,
      padding: '3px 9px', borderRadius: 3,
      fontSize: 10, fontWeight: 800,
      display: 'inline-block', letterSpacing: '0.08em'
    }}>
      {label}
    </span>
  )
}