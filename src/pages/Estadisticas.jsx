import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell
} from 'recharts'
import { getEstadisticas } from '../api/equipos'
import { getUsuarios } from '../api/auth'
import { pageTitle } from '../components/UI'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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
  por_reparar:    '#e6b800',
  en_reparacion:  '#185fa5',
  espera_repuesto:'#6b2fa0',
  reparado:       '#3b6011',
  irreparable:    '#8a0000',
  entregado:      '#888780',
}

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState('mes')
  const [usuarioId, setUsuarioId] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar lista de técnicos una sola vez
  useEffect(() => {
    getUsuarios().then(r => setUsuarios(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getEstadisticas(periodo, usuarioId || undefined)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [periodo, usuarioId])

  const totalEquipos = data?.totales.reduce((acc, t) => acc + parseInt(t.total), 0) ?? 0
  const totalFacturado = parseFloat(data?.costos?.total_facturado ?? 0)
  const promedio = parseFloat(data?.costos?.promedio ?? 0)

  const barData = data?.totales.map(t => ({
    estado: ESTADO_LABELS[t.estado_actual] ?? t.estado_actual,
    total: parseInt(t.total),
    color: ESTADO_COLORS[t.estado_actual] ?? '#888'
    })) ?? []
  const lineData = data?.porDia.map(d => ({
    fecha: new Date(d.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
    ingresos: parseInt(d.ingresos)
  })) ?? []

  const exportarPDF = () => {
    const doc = new jsPDF()
    const tecnicoNombre = usuarioId
      ? usuarios.find(u => String(u.id) === String(usuarioId))?.nombre ?? 'Técnico'
      : null
    doc.setFontSize(16)
    doc.text('Light Solution — Estadísticas', 14, 20)
    doc.setFontSize(10)
    const subtitulo = [
      `Período: ${PERIODOS.find(p => p.key === periodo)?.label}`,
      tecnicoNombre ? `Técnico: ${tecnicoNombre}` : null,
      new Date().toLocaleDateString('es-CL')
    ].filter(Boolean).join(' · ')
    doc.text(subtitulo, 14, 30)
    doc.autoTable({
      startY: 38,
      head: [['Estado', 'Total']],
      body: barData.map(d => [d.estado, d.total])
    })
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total facturado', `$${totalFacturado.toLocaleString('es-CL')}`],
        ['Costo promedio', `$${promedio.toLocaleString('es-CL')}`],
        ['Total equipos', totalEquipos]
      ]
    })
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Fecha', 'Ingresos']],
      body: lineData.map(d => [d.fecha, d.ingresos])
    })
    doc.save(`estadisticas-${periodo}-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={pageTitle}>Estadísticas</h1>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Filtro por período */}
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

          {/* Filtro por técnico */}
          {usuarios.length > 0 && (
            <select
              value={usuarioId}
              onChange={e => setUsuarioId(e.target.value)}
              style={{
                border: '1px solid var(--input-border)', borderRadius: 4,
                padding: '7px 10px', fontSize: 11, fontWeight: 700,
                background: usuarioId ? 'var(--primary)' : 'var(--white)',
                color: usuarioId ? 'var(--black)' : 'var(--text-secondary)',
                cursor: 'pointer', appearance: 'none', paddingRight: 24
              }}
            >
              <option value="">TODOS LOS TÉCNICOS</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nombre.toUpperCase()}</option>
              ))}
            </select>
          )}

          <button
            onClick={exportarPDF}
            disabled={loading || !data}
            style={{
              background: '#000', color: '#ffcd0d', border: 'none',
              borderRadius: 4, padding: '7px 14px', fontSize: 11,
              fontWeight: 800, letterSpacing: '0.06em', cursor: loading || !data ? 'not-allowed' : 'pointer',
              opacity: loading || !data ? 0.5 : 1
            }}
          >
            EXPORTAR PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando...</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
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
                  <XAxis
                    dataKey="estado"
                    tick={{ fontSize: 10, fill: 'var(--text-3)' }}
                    axisLine={{ stroke: 'var(--border-color)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text-3)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: 4, fontSize: 12
                    }}
                    cursor={{ fill: 'var(--bg-row-hover)' }}
                  />
                  <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 10, fill: 'var(--text-3)' }}
                      axisLine={{ stroke: 'var(--border-color)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--text-3)' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: 4, fontSize: 12
                      }}
                    />
                    <Line
                      type="monotone" dataKey="ingresos"
                      stroke="var(--primary)" strokeWidth={2}
                      dot={{ fill: 'var(--primary)', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: 'var(--primary)' }}
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
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 6, padding: '20px 22px',
      borderLeft: '4px solid var(--primary)',
      flex: 1
    }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-1)', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{
        fontSize: 10, color: 'var(--text-3)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em'
      }}>{label}</div>
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