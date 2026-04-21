import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getEquipo, getHistorial } from '../api/equipos'

export default function OrdenTrabajo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [equipo, setEquipo] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEquipo(id), getHistorial(id)])
      .then(([eq, hist]) => {
        setEquipo(eq.data)
        setHistorial(hist.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Cargando...</div>
  if (!equipo) return <div style={{ padding: 40 }}>Equipo no encontrado</div>

  const formatFecha = (iso) => iso ? new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'long', year: 'numeric'
  }) : '—'

  const estadoLabel = {
    por_reparar: 'Por reparar', en_reparacion: 'En reparación',
    reparado: 'Reparado', irreparable: 'Irreparable', entregado: 'Entregado',
    espera_repuesto: 'Espera repuesto'
  }

  const seguimientoUrl = `${window.location.origin}/seguimiento?n=${encodeURIComponent(equipo.numero_ingreso)}`

  const tienePresupuesto = equipo.presupuesto_monto && equipo.presupuesto_aprobado === true

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: var(--white) !important; }
          .orden { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
        @page { margin: 18mm; size: A4; }
        body { background: var(--surface); }
      `}</style>

      <div className="no-print" style={{
        background: 'var(--black)', padding: '12px 32px',
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <button onClick={() => navigate(`/equipos/${id}`)} style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 4,
          color: 'var(--text-secondary)', padding: '6px 14px', fontSize: 11,
          fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em'
        }}>← VOLVER</button>
        <button onClick={() => window.print()} style={{
          background: 'var(--primary)', border: 'none', borderRadius: 4,
          color: 'var(--black)', padding: '6px 20px', fontSize: 11,
          fontWeight: 900, cursor: 'pointer', letterSpacing: '0.08em'
        }}>IMPRIMIR / GUARDAR PDF</button>
      </div>

      <div style={{ padding: '32px', background: 'var(--surface)', minHeight: '100vh' }}>
        <div className="orden" style={{
          background: 'var(--white)', maxWidth: 780,
          margin: '0 auto', padding: '40px 48px',
        }}>

          {/* ── Encabezado ─────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 32,
            paddingBottom: 24, borderBottom: '3px solid var(--primary)'
          }}>
            <div>
              <div style={{
                background: 'var(--primary)', color: 'var(--black)', fontSize: 11,
                fontWeight: 900, padding: '5px 12px', borderRadius: 3,
                display: 'inline-block', letterSpacing: '0.1em', marginBottom: 8
              }}>LIGHT SOLUTION</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Servicio Técnico
              </div>
            </div>

            {/* QR + N° ingreso */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Orden de trabajo
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: 'var(--black)' }}>
                  {equipo.numero_ingreso}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {formatFecha(equipo.fecha_ingreso)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <QRCodeSVG
                  value={seguimientoUrl}
                  size={72}
                  fgColor="#000"
                  bgColor="#fff"
                  level="M"
                />
                <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.04em' }}>
                  SEGUIMIENTO
                </div>
              </div>
            </div>
          </div>

          {/* ── Datos cliente / equipo ───────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
            <div>
              <div style={{
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 10,
                borderBottom: '1px solid var(--border)', paddingBottom: 6
              }}>Datos del cliente</div>
              <Row label="Nombre" value={equipo.cliente_nombre} />
              <Row label="Teléfono" value={equipo.cliente_telefono} />
            </div>
            <div>
              <div style={{
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 10,
                borderBottom: '1px solid var(--border)', paddingBottom: 6
              }}>Datos del equipo</div>
              <Row label="Tipo" value={equipo.tipo_equipo} />
              <Row label="Marca" value={equipo.marca} />
              <Row label="Modelo" value={equipo.modelo} />
              <Row label="N° serie" value={equipo.password_pin} />
              <Row label="Accesorios" value={equipo.accesorios} />
            </div>
          </div>

          <Section title="Falla reportada por el cliente">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {equipo.falla_reportada ?? '—'}
            </div>
          </Section>

          <Section title="Diagnóstico técnico">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {equipo.diagnostico ?? '—'}
            </div>
          </Section>

          <Section title="Observaciones">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {equipo.observaciones ?? '—'}
            </div>
          </Section>

          {/* ── Estado + Costo ───────────────────────────── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28
          }}>
            <Section title="Estado final">
              <div style={{
                fontSize: 13, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--black)'
              }}>
                {estadoLabel[equipo.estado_actual] ?? equipo.estado_actual}
              </div>
            </Section>
            <Section title="Costo de reparación">
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--black)' }}>
                {equipo.costo_reparacion
                  ? `$${Number(equipo.costo_reparacion).toLocaleString('es-CL')}`
                  : '—'}
              </div>
            </Section>
          </div>

          {/* ── Presupuesto aprobado ─────────────────────── */}
          {tienePresupuesto && (
            <Section title="Presupuesto aprobado por el cliente">
              <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--black)' }}>
                    ${Number(equipo.presupuesto_monto).toLocaleString('es-CL')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Aprobado el {formatFecha(equipo.presupuesto_aprobado_en)}
                  </div>
                </div>
                {equipo.presupuesto_notas && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', flex: 1 }}>
                    "{equipo.presupuesto_notas}"
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── Garantía ─────────────────────────────────── */}
          {equipo.garantia_hasta && (
            <Section title="Garantía de reparación">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--black)' }}>
                Válida hasta: {formatFecha(equipo.garantia_hasta)}
              </div>
            </Section>
          )}

          {/* ── Historial ────────────────────────────────── */}
          {historial.length > 0 && (
            <Section title="Historial de estados">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '5px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 10 }}>FECHA</th>
                    <th style={{ padding: '5px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 10 }}>CAMPO</th>
                    <th style={{ padding: '5px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 10 }}>CAMBIO</th>
                    <th style={{ padding: '5px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 10 }}>TÉCNICO</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historial].reverse().map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(h.fecha_cambio).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>
                        {h.campo_modificado.replace(/_/g, ' ')}
                      </td>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{h.valor_anterior ?? 'vacío'}</span>
                        <span style={{ margin: '0 6px', color: 'var(--border)' }}>→</span>
                        <span style={{ fontWeight: 600 }}>{h.valor_nuevo}</span>
                      </td>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{h.usuario_nombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* ── Firmas ───────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 48 }}>
            {/* Firma técnico: siempre manual */}
            <Firma label="Firma técnico" />

            {/* Firma cliente: digital si existe, manual si no */}
            {equipo.firma_url ? (
              <div>
                <div style={{ marginBottom: 8, height: 72, display: 'flex', alignItems: 'flex-end' }}>
                  <img
                    src={equipo.firma_url}
                    alt="Firma digital del cliente"
                    style={{ maxHeight: 64, maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ borderTop: '1.5px solid var(--black)', paddingTop: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Firma cliente / Conforme
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                    Firma digital registrada
                  </div>
                </div>
              </div>
            ) : (
              <Firma label="Firma cliente / Conforme" />
            )}
          </div>

          {/* ── Pie de página ────────────────────────────── */}
          <div style={{
            marginTop: 36, paddingTop: 16, borderTop: '1px solid var(--border)',
            fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.06em'
          }}>
            LIGHT SOLUTION — SERVICIO TÉCNICO · DOCUMENTO GENERADO EL {new Date().toLocaleDateString('es-CL').toUpperCase()}
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 70 }}>{label}:</span>
      <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>{value ?? '—'}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 8,
        borderBottom: '1px solid var(--border)', paddingBottom: 6
      }}>{title}</div>
      {children}
    </div>
  )
}

function Firma({ label }) {
  return (
    <div>
      <div style={{ borderBottom: '1.5px solid var(--black)', marginBottom: 8, height: 48 }} />
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  )
}
