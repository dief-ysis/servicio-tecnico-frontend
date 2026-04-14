import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { getEstadisticas } from '../api/equipos'
import { pageTitle } from '../components/UI'

const PERIODOS = [
  { key: 'semana', label: 'Última semana' },
  { key: 'mes',   label: 'Último mes'    },
  { key: 'año',   label: 'Último año'    },
]

const ESTADO_LABELS = {
  por_reparar: 'Por reparar', en_reparacion: 'En reparación',
  reparado: 'Reparado', irreparable: 'Irreparable', entregado: 'Entregado'
}

const ESTADO_COLORS = {
  por_reparar: 'var(--warning-text)', en_reparacion: 'var(--info-text)',
  reparado: 'var(--success-text)', irreparable: 'var(--danger-text)', entregado: 'var(--text-secondary)'
}

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState('mes')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEstadisticas(periodo)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [periodo])

  const totalEquipos = data?.totales.reduce((acc, t) => acc + parseInt(t.total), 0) ?? 0
  const totalFacturado = parseFloat(data?.costos?.total_facturado ?? 0)
  const promedio = parseFloat(data?.costos?.promedio ?? 0)

  const barData = data?.totales.map(t => ({
    estado: ESTADO_LABELS[t.estado_actual] ?? t.estado_actual,
    total: parseInt(t.total),
    color: ESTADO_COLORS[t.estado_actual] ?? 'var(--text-muted)'
  })) ?? []

  const lineData = data?.porDia.map(d => ({
    fecha: new Date(d.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
    ingresos: parseInt(d.ingresos)
  })) ?? []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={pageTitle}>Estadísticas</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODOS.map(p => (
            <button key={p.key} onClick={() => setPeriodo(p.key)} style={{
              background: periodo === p.key ? 'var(--primary)' : 'var(--white)',
              border: '1px solid var(--input-border)', borderRadius: 4,
              padding: '7px 14px', fontSize: 11, fontWeight: 800,
              letterSpacing: '0.06em', cursor: 'pointer',
              color: periodo === p.key ? 'var(--black)' : 'var(--text-secondary)'
            }}>
              {p.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            <StatCard label="Total equipos" value={totalEquipos} />
            <StatCard
              label="Total facturado"
              value={`$${totalFacturado.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`}
            />
            <StatCard
              label="Costo promedio"
              value={promedio > 0
                ? `$${promedio.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`
                : '—'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <ChartCard titulo="Equipos por estado">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <XAxis dataKey="estado" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid var(--border-color)', borderRadius: 4 }}
                    cursor={{ fill: 'var(--border)' }}
                  />
                  <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                    {barData.map((entry, i) => (
                      <rect key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard titulo="Ingresos por día">
              {lineData.length === 0 ? (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  Sin datos para este período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lineData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, border: '1px solid var(--border-color)', borderRadius: 4 }}
                    />
                    <Line
                      type="monotone" dataKey="ingresos"
                      stroke="var(--primary)" strokeWidth={2}
                      dot={{ fill: 'var(--primary)', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border-color)',
      borderRadius: 6, padding: '16px 18px',
      borderLeft: '4px solid var(--primary)'
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--black)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
    </div>
  )
}

function ChartCard({ titulo, children }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border-color)',
      borderRadius: 8, padding: '18px 20px'
    }}>
      <div style={{
        fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 16
      }}>{titulo}</div>
      {children}
    </div>
  )
}