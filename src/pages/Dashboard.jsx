import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEstadisticas } from '../api/equipos'
import EstadoBadge from '../components/EstadoBadge'
import { SkeletonCard, SkeletonTable } from '../components/Skeleton'
import { btnPrimary } from '../components/UI'
import client from '../api/client'

const getAlertas = () => client.get('/equipos/alertas')

const statConfig = [
  { key: 'por_reparar',     label: 'Por reparar',     color: '#8a6500', bg: '#fff8d6' },
  { key: 'en_reparacion',   label: 'En reparación',   color: '#1a4f8a', bg: '#e6f0fb' },
  { key: 'espera_repuesto', label: 'Espera repuesto', color: '#6b2fa0', bg: '#f5eafd' },
  { key: 'reparado',        label: 'Reparados',       color: '#3b6011', bg: '#eaf3de' },
  { key: 'irreparable',     label: 'Irreparables',    color: '#8a0000', bg: '#fce8e8' },
]

const thStyle = {
  padding: '9px 16px', textAlign: 'left', fontSize: 10,
  color: 'var(--text-3)', fontWeight: 800,
  borderBottom: '1px solid var(--border-color)',
  letterSpacing: '0.1em', textTransform: 'uppercase'
}

const formatFecha = (iso) => iso
  ? new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  : '—'

const diasDesde = (iso) => {
  if (!iso) return '?'
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000)
  return `${d}d`
}

export default function Dashboard() {
  const [alertas, setAlertas] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAlertas()
      .then(r => setAlertas(r.data))
      .finally(() => setLoading(false))
  }, [])

  const conteo = alertas?.conteo ?? {}
  const listos = alertas?.listos ?? []
  const sinMov = alertas?.sin_movimiento ?? []
  const esperaCritico = alertas?.espera_repuesto_critico ?? []
  const garantias = alertas?.garantias_por_vencer ?? []

  const pendientes = [
    ...(alertas?.sin_movimiento ?? []),
    ...(alertas?.espera_repuesto_critico ?? []),
  ].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i) // dedup

  // Todos los que están en trabajo (no alertas, solo los normales)
  // Usamos conteo para las cards

  return (
    <div>
      <h1 style={{
        fontSize: 18, fontWeight: 900, color: 'var(--text-1)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24
      }}>
        Dashboard
      </h1>

      {/* ── Cards de estado ── */}
      {loading ? <SkeletonCard /> : (
        <div className="stat-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12, marginBottom: 28
        }}>
          {statConfig.map(({ key, label, color }) => (
            <div key={key}
              onClick={() => navigate(`/equipos?estado=${key}`)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 6, padding: '16px 18px',
                borderLeft: `4px solid ${color}`,
                cursor: 'pointer', transition: 'opacity 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color }}>{conteo[key] ?? 0}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alertas críticas (badges) ── */}
      {!loading && (sinMov.length > 0 || esperaCritico.length > 0 || garantias.length > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {sinMov.length > 0 && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid var(--danger-text)',
              borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700,
              color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: 6
            }}>
              🔴 {sinMov.length} equipo{sinMov.length > 1 ? 's' : ''} sin movimiento +7 días
            </div>
          )}
          {esperaCritico.length > 0 && (
            <div style={{
              background: '#f5eafd', border: '1px solid #c9a0e8',
              borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700,
              color: '#6b2fa0', display: 'flex', alignItems: 'center', gap: 6
            }}>
              🟣 {esperaCritico.length} equipo{esperaCritico.length > 1 ? 's' : ''} esperando repuesto +14 días
            </div>
          )}
          {garantias.length > 0 && (
            <div style={{
              background: 'var(--warning-bg)', border: '1px solid #e6d060',
              borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700,
              color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: 6
            }}>
              🟡 {garantias.length} garantía{garantias.length > 1 ? 's' : ''} por vencer esta semana
            </div>
          )}
        </div>
      )}

      {/* ── Listos para entregar ── */}
      {!loading && listos.length > 0 && (
        <TableSection
          titulo={`✅ Listos para entregar — ${listos.length}`}
          headerBg="var(--success-bg)"
          headerColor="var(--success-text)"
          cols={['N° Ingreso', 'Cliente', 'Teléfono', 'Equipo', 'Costo', '']}
          rows={listos}
          renderRow={(eq) => (
            <tr key={eq.id}
              onClick={() => navigate(`/equipos/${eq.id}`)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>
                {eq.numero_ingreso}
              </td>
              <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, borderBottom: '0.5px solid var(--border-color)' }}>
                {eq.cliente_nombre}
              </td>
              <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                {eq.cliente_telefono
                  ? <a href={`tel:${eq.cliente_telefono}`} onClick={e => e.stopPropagation()}
                       style={{ fontSize: 13, color: 'var(--link)', fontWeight: 700, textDecoration: 'none' }}>
                      📞 {eq.cliente_telefono}
                    </a>
                  : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
              </td>
              <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>
                {eq.marca} {eq.modelo || eq.tipo_equipo}
              </td>
              <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 900, borderBottom: '0.5px solid var(--border-color)' }}>
                {eq.costo_reparacion
                  ? `$${Number(eq.costo_reparacion).toLocaleString('es-CL')}`
                  : <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>—</span>}
              </td>
              <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, color: 'var(--link)', fontWeight: 700 }}>Ver →</span>
              </td>
            </tr>
          )}
        />
      )}

      {/* ── Sin movimiento >7 días ── */}
      {!loading && sinMov.length > 0 && (
        <TableSection
          titulo={`🔴 Sin movimiento +7 días — ${sinMov.length}`}
          headerBg="var(--danger-bg)"
          headerColor="var(--danger-text)"
          cols={['N° Ingreso', 'Cliente', 'Equipo', 'Estado', 'Sin cambio']}
          rows={sinMov}
          renderRow={(eq) => (
            <tr key={eq.id}
              onClick={() => navigate(`/equipos/${eq.id}`)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>{eq.numero_ingreso}</td>
              <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>{eq.cliente_nombre}</td>
              <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>{eq.marca} {eq.tipo_equipo}</td>
              <td style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border-color)' }}><EstadoBadge estado={eq.estado_actual} /></td>
              <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: 'var(--danger-text)', borderBottom: '0.5px solid var(--border-color)' }}>
                {diasDesde(eq.ultimo_cambio)}
              </td>
            </tr>
          )}
        />
      )}

      {/* ── Espera repuesto crítico >14 días ── */}
      {!loading && esperaCritico.length > 0 && (
        <TableSection
          titulo={`🟣 Espera repuesto +14 días — ${esperaCritico.length}`}
          headerBg="#f5eafd"
          headerColor="#6b2fa0"
          cols={['N° Ingreso', 'Cliente', 'Equipo', 'En espera desde']}
          rows={esperaCritico}
          renderRow={(eq) => (
            <tr key={eq.id}
              onClick={() => navigate(`/equipos/${eq.id}`)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>{eq.numero_ingreso}</td>
              <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>{eq.cliente_nombre}</td>
              <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>{eq.marca} {eq.tipo_equipo}</td>
              <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#6b2fa0', borderBottom: '0.5px solid var(--border-color)' }}>
                {diasDesde(eq.ultimo_cambio)}
              </td>
            </tr>
          )}
        />
      )}

      {/* ── Garantías por vencer ── */}
      {!loading && garantias.length > 0 && (
        <TableSection
          titulo={`🟡 Garantías por vencer esta semana — ${garantias.length}`}
          headerBg="var(--warning-bg)"
          headerColor="var(--warning-text)"
          cols={['N° Ingreso', 'Cliente', 'Equipo', 'Vence']}
          rows={garantias}
          renderRow={(eq) => (
            <tr key={eq.id}
              onClick={() => navigate(`/equipos/${eq.id}`)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>{eq.numero_ingreso}</td>
              <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>{eq.cliente_nombre}</td>
              <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>{eq.marca} {eq.tipo_equipo}</td>
              <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: 'var(--warning-text)', borderBottom: '0.5px solid var(--border-color)' }}>
                {formatFecha(eq.garantia_hasta)}
              </td>
            </tr>
          )}
        />
      )}

      {/* ── Sin alertas ── */}
      {!loading && listos.length === 0 && sinMov.length === 0 && esperaCritico.length === 0 && garantias.length === 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '40px 20px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Todo al día</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No hay equipos pendientes ni alertas activas</div>
        </div>
      )}
    </div>
  )
}

// Componente reutilizable para tablas de alertas
function TableSection({ titulo, headerBg, headerColor, cols, rows, renderRow }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 8, overflow: 'hidden', marginTop: 16
    }}>
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-color)',
        background: headerBg
      }}>
        <span style={{ fontWeight: 900, fontSize: 11, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: headerColor }}>
          {titulo}
        </span>
      </div>
      <div className="tabla-scroll">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-table-head)' }}>
              {cols.map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>{rows.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  )
}
