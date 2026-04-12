const config = {
  por_reparar:   { label: 'POR REPARAR',   bg: '#fff8d6', color: '#8a6500', border: '#e6d060' },
  en_reparacion: { label: 'EN REPARACIÓN', bg: '#e6f0fb', color: '#1a4f8a', border: '#a0c0e8' },
  reparado:      { label: 'REPARADO',      bg: '#eaf3de', color: '#3b6011', border: '#a8cc80' },
  irreparable:   { label: 'IRREPARABLE',   bg: '#fce8e8', color: '#8a0000', border: '#e8a0a0' },
  entregado:     { label: 'ENTREGADO',     bg: '#f0f0f0', color: '#444',    border: '#ccc'    },
}

export default function EstadoBadge({ estado }) {
  const { label, bg, color, border } = config[estado] ?? { label: estado, bg: '#eee', color: '#333', border: '#ccc' }
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