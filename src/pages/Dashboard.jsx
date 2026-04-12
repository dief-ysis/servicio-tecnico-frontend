import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEquipos } from '../api/equipos'
import EstadoBadge from '../components/EstadoBadge'
import { SkeletonCard, SkeletonTable } from '../components/Skeleton'
import { pageTitle, btnPrimary, card, thStyle, tdStyle } from '../components/UI'

const estados = ['por_reparar', 'en_reparacion', 'reparado', 'irreparable', 'entregado']

const statConfig = [
  { key: 'por_reparar',   label: 'Por reparar',   color: '#8a6500', bg: '#fff8d6' },
  { key: 'en_reparacion', label: 'En reparación', color: '#1a4f8a', bg: '#e6f0fb' },
  { key: 'reparado',      label: 'Reparados',     color: '#3b6011', bg: '#eaf3de' },
  { key: 'irreparable',   label: 'Irreparables',  color: '#8a0000', bg: '#fce8e8' },
]

export default function Dashboard() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getEquipos().then(r => setEquipos(r.data)).finally(() => setLoading(false))
  }, [])

  const conteo = estados.reduce((acc, e) => {
    acc[e] = equipos.filter(eq => eq.estado_actual === e).length
    return acc
  }, {})

  const pendientes = equipos.filter(e =>
    e.estado_actual === 'por_reparar' || e.estado_actual === 'en_reparacion'
  )

  const listos = equipos.filter(e => e.estado_actual === 'reparado')

  const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short'
  })

  return (
    <div>
      <h1 style={pageTitle}>
        Dashboard
      </h1>

      {loading ? <SkeletonCard /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {statConfig.map(({ key, label, color, bg }) => (
            <div key={key} style={{
              background: '#fff', border: '1px solid #e8e8e8',
              borderRadius: 6, padding: '16px 18px',
              borderLeft: `4px solid ${color}`
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color }}>{conteo[key] ?? 0}</div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 3, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: '#fff', border: '0.5px solid #e8e8e8',
        borderRadius: 10, overflow: 'hidden'
      }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafafa'
        }}>
          <span style={{ fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Equipos pendientes
          </span>
          <button onClick={() => navigate('/equipos')} style={btnPrimary}>
            Ver todos
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['N° Ingreso', 'Cliente', 'Equipo', 'Falla', 'Estado', 'Ingreso'].map(h => (
                <th key={h} style={{
                  padding: '9px 16px', textAlign: 'left',
                  fontSize: 11, color: '#888', fontWeight: 600,
                  borderBottom: '0.5px solid #eee', letterSpacing: '0.05em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTable rows={4} cols={6} />
            ) : pendientes.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 12 }}>
                No hay equipos pendientes
              </td></tr>
            ) : pendientes.map(eq => (
              <tr key={eq.id}
                onClick={() => navigate(`/equipos/${eq.id}`)}
                style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 12, color: '#334862', borderBottom: '0.5px solid #f5f5f5' }}>
                  {eq.numero_ingreso}
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid #f5f5f5' }}>
                  {eq.cliente_nombre}
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid #f5f5f5' }}>
                  {eq.marca} {eq.modelo}
                </td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#666', borderBottom: '0.5px solid #f5f5f5', maxWidth: 180 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eq.falla_reportada ?? '—'}
                  </div>
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid #f5f5f5' }}>
                  <EstadoBadge estado={eq.estado_actual} />
                </td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f5f5' }}>
                  {formatFecha(eq.fecha_ingreso)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {listos.length > 0 && (
        <div style={{
          background: '#fff', border: '1px solid #e8e8e8',
          borderRadius: 8, overflow: 'hidden', marginTop: 16
        }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #eee',
            background: '#eaf3de', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{
              fontWeight: 900, fontSize: 11, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#3b6011'
            }}>
              Listos para entregar — {listos.length}
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['N° Ingreso', 'Cliente', 'Teléfono', 'Equipo', 'Costo', ''].map(h => (
                  <th key={h} style={{
                    padding: '9px 16px', textAlign: 'left', fontSize: 10,
                    color: '#999', fontWeight: 800, borderBottom: '1px solid #eee',
                    letterSpacing: '0.1em', textTransform: 'uppercase'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listos.map(eq => (
                <tr key={eq.id}
                  onClick={() => navigate(`/equipos/${eq.id}`)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 12, color: '#334862', borderBottom: '1px solid #f5f5f5' }}>
                    {eq.numero_ingreso}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
                    {eq.cliente_nombre}
                  </td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    {eq.cliente_telefono
                      ? <a href={`tel:${eq.cliente_telefono}`} style={{
                          fontSize: 13, color: '#334862', fontWeight: 700,
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5
                        }}>
                          📞 {eq.cliente_telefono}
                        </a>
                      : <span style={{ color: '#999', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {eq.marca} {eq.modelo || eq.tipo_equipo}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 900, borderBottom: '1px solid #f5f5f5' }}>
                    {eq.costo_reparacion
                      ? `$${Number(eq.costo_reparacion).toLocaleString('es-CL')}`
                      : <span style={{ color: '#999', fontWeight: 400 }}>—</span>}
                  </td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <span style={{ fontSize: 11, color: '#334862', fontWeight: 700 }}>Ver →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}