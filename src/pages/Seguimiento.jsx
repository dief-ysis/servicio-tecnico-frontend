import { useState } from 'react'
import { consultarEquipo } from '../api/public'

const estadoLabels = {
  por_reparar:     { label: 'Por reparar',     color: '#92600a',  bg: '#fff9e6', border: '#e6d060' },
  en_reparacion:   { label: 'En reparación',   color: '#1a5fa8',  bg: '#e8f2fd', border: '#a0c0e8' },
  espera_repuesto: { label: 'Espera repuesto', color: '#6b2fa0',  bg: '#f5eafd', border: '#c9a0e8' },
  reparado:        { label: 'Reparado',         color: '#1a7a3c',  bg: '#eafaf0', border: '#a8cc80' },
  irreparable:     { label: 'Irreparable',      color: '#8a0000',  bg: '#fdeaea', border: '#e8a0a0' },
  entregado:       { label: 'Entregado',        color: '#555',     bg: '#f0f0f0', border: '#ccc' },
}

function formatFecha(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function Seguimiento() {
  const [numero, setNumero] = useState('')
  const [equipo, setEquipo] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const consultar = async (e) => {
    e.preventDefault()
    const n = numero.trim()
    if (!n) return
    setCargando(true)
    setEquipo(null)
    setError('')
    try {
      const res = await consultarEquipo(n)
      setEquipo(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontró ningún equipo con ese número de ingreso.')
      } else {
        setError('Error al consultar. Intenta más tarde.')
      }
    } finally {
      setCargando(false)
    }
  }

  const estadoCfg = equipo ? (estadoLabels[equipo.estado_actual] ?? { label: equipo.estado_actual, color: '#333', bg: '#f5f5f5', border: '#ccc' }) : null

  return (
    <div style={{
      minHeight: '100vh', background: '#f9f9f7',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 16px'
    }}>
      {/* Logo / Header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          fontSize: 10, fontWeight: 900, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#555', marginBottom: 4
        }}>Light Solution</div>
        <div style={{
          fontSize: 22, fontWeight: 900, color: '#111',
          letterSpacing: '0.04em', textTransform: 'uppercase'
        }}>Servicio Técnico</div>
        <div style={{
          width: 40, height: 3, background: '#ffcd0d',
          margin: '10px auto 0', borderRadius: 2
        }} />
      </div>

      {/* Formulario */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#fff', borderRadius: 12,
        border: '1px solid #e5e5e5',
        padding: '32px 28px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
      }}>
        <h2 style={{
          fontSize: 15, fontWeight: 900, color: '#111',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 6
        }}>Consultar estado de mi equipo</h2>
        <p style={{ fontSize: 13, color: '#777', marginBottom: 24, lineHeight: 1.5 }}>
          Ingresa el número de ingreso que aparece en tu comprobante para ver el estado actual de tu equipo.
        </p>

        <form onSubmit={consultar} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={numero}
            onChange={e => setNumero(e.target.value.toUpperCase())}
            placeholder="Ej: ST-2026-0001"
            style={{
              flex: 1, border: '1px solid #ddd', borderRadius: 6,
              padding: '10px 13px', fontSize: 14, outline: 'none',
              fontFamily: 'monospace', letterSpacing: '0.05em',
              color: '#111', background: '#fafafa'
            }}
          />
          <button
            type="submit"
            disabled={cargando || !numero.trim()}
            style={{
              background: '#000', color: '#ffcd0d', border: 'none',
              borderRadius: 6, padding: '10px 20px', fontSize: 12,
              fontWeight: 900, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: cargando ? 'wait' : 'pointer',
              opacity: cargando || !numero.trim() ? 0.6 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            {cargando ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 20, background: '#fdeaea', border: '1px solid #e8a0a0',
            borderRadius: 6, padding: '12px 14px',
            fontSize: 13, color: '#8a0000', fontWeight: 600
          }}>
            {error}
          </div>
        )}

        {/* Resultado */}
        {equipo && estadoCfg && (
          <div style={{ marginTop: 24 }}>
            <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
              {/* N° ingreso + estado */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#555' }}>
                  {equipo.numero_ingreso}
                </div>
                <div style={{
                  background: estadoCfg.bg, color: estadoCfg.color,
                  border: `1px solid ${estadoCfg.border}`,
                  borderRadius: 20, padding: '4px 14px',
                  fontSize: 11, fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  {estadoCfg.label}
                </div>
              </div>

              {/* Datos del equipo */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#111', marginBottom: 2 }}>
                  {equipo.marca} {equipo.modelo}
                </div>
                <div style={{ fontSize: 13, color: '#777' }}>{equipo.tipo_equipo}</div>
              </div>

              {/* Filas de info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <InfoRow label="Ingresado el" value={formatFecha(equipo.fecha_ingreso)} />

                {equipo.diagnostico && (
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                      Diagnóstico técnico
                    </div>
                    <div style={{
                      background: '#f8f8f6', border: '1px solid #e8e8e6',
                      borderRadius: 6, padding: '10px 12px',
                      fontSize: 13, color: '#333', lineHeight: 1.6
                    }}>
                      {equipo.diagnostico}
                    </div>
                  </div>
                )}

                {equipo.costo_reparacion && Number(equipo.costo_reparacion) > 0 && (
                  <InfoRow
                    label="Costo de reparación"
                    value={`$${Number(equipo.costo_reparacion).toLocaleString('es-CL')}`}
                    bold
                  />
                )}

                {equipo.fecha_entrega && (
                  <InfoRow label="Fecha de entrega" value={formatFecha(equipo.fecha_entrega)} />
                )}

                {equipo.garantia_hasta && (
                  <InfoRow
                    label="Garantía hasta"
                    value={formatFecha(equipo.garantia_hasta)}
                    highlight
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, fontSize: 11, color: '#aaa', textAlign: 'center' }}>
        ¿Tienes dudas? Contacta a nuestro taller directamente.
      </div>
    </div>
  )
}

function InfoRow({ label, value, bold, highlight }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{
        fontSize: 9, fontWeight: 900, color: '#aaa',
        textTransform: 'uppercase', letterSpacing: '0.12em',
        minWidth: 130, flexShrink: 0
      }}>{label}</span>
      <span style={{
        fontSize: 13,
        color: highlight ? '#1a7a3c' : '#111',
        fontWeight: bold || highlight ? 700 : 400
      }}>{value}</span>
    </div>
  )
}
