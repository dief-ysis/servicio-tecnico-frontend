import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

  if (loading) return <div style={{ padding: 40, color: '#999' }}>Cargando...</div>
  if (!equipo) return <div style={{ padding: 40 }}>Equipo no encontrado</div>

  const formatFecha = (iso) => iso ? new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'long', year: 'numeric'
  }) : '—'

  const estadoLabel = {
    por_reparar: 'Por reparar', en_reparacion: 'En reparación',
    reparado: 'Reparado', irreparable: 'Irreparable', entregado: 'Entregado'
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .orden { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
        @page { margin: 18mm; size: A4; }
        body { background: #f5f5f5; }
      `}</style>

      <div className="no-print" style={{
        background: '#000', padding: '12px 32px',
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <button onClick={() => navigate(`/equipos/${id}`)} style={{
          background: 'none', border: '1px solid #333', borderRadius: 4,
          color: '#aaa', padding: '6px 14px', fontSize: 11,
          fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em'
        }}>← VOLVER</button>
        <button onClick={() => window.print()} style={{
          background: '#ffcd0d', border: 'none', borderRadius: 4,
          color: '#000', padding: '6px 20px', fontSize: 11,
          fontWeight: 900, cursor: 'pointer', letterSpacing: '0.08em'
        }}>IMPRIMIR / GUARDAR PDF</button>
      </div>

      <div style={{ padding: '32px', background: '#f5f5f5', minHeight: '100vh' }}>
        <div className="orden" style={{
          background: '#fff', maxWidth: 780,
          margin: '0 auto', padding: '40px 48px',
        }}>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 32,
            paddingBottom: 24, borderBottom: '3px solid #ffcd0d'
          }}>
            <div>
              <div style={{
                background: '#ffcd0d', color: '#000', fontSize: 11,
                fontWeight: 900, padding: '5px 12px', borderRadius: 3,
                display: 'inline-block', letterSpacing: '0.1em', marginBottom: 8
              }}>LIGHT SOLUTION</div>
              <div style={{ fontSize: 10, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Servicio Técnico
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Orden de trabajo
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#000' }}>
                {equipo.numero_ingreso}
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                {formatFecha(equipo.fecha_ingreso)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
            <div>
              <div style={{
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: '#999', marginBottom: 10,
                borderBottom: '1px solid #eee', paddingBottom: 6
              }}>Datos del cliente</div>
              <Row label="Nombre" value={equipo.cliente_nombre} />
              <Row label="Teléfono" value={equipo.cliente_telefono} />
            </div>
            <div>
              <div style={{
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: '#999', marginBottom: 10,
                borderBottom: '1px solid #eee', paddingBottom: 6
              }}>Datos del equipo</div>
              <Row label="Tipo" value={equipo.tipo_equipo} />
              <Row label="Marca" value={equipo.marca} />
              <Row label="Modelo" value={equipo.modelo} />
              <Row label="N° serie" value={equipo.password_pin} />
              <Row label="Accesorios" value={equipo.accesorios} />
            </div>
          </div>

          <Section title="Falla reportada por el cliente">
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>
              {equipo.falla_reportada ?? '—'}
            </div>
          </Section>

          <Section title="Diagnóstico técnico">
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>
              {equipo.diagnostico ?? '—'}
            </div>
          </Section>

          <Section title="Observaciones">
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>
              {equipo.observaciones ?? '—'}
            </div>
          </Section>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28
          }}>
            <Section title="Estado final">
              <div style={{
                fontSize: 13, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#000'
              }}>
                {estadoLabel[equipo.estado_actual] ?? equipo.estado_actual}
              </div>
            </Section>
            <Section title="Costo de reparación">
              <div style={{ fontSize: 20, fontWeight: 900, color: '#000' }}>
                {equipo.costo_reparacion
                  ? `$${Number(equipo.costo_reparacion).toLocaleString('es-CL')}`
                  : '—'}
              </div>
            </Section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 48 }}>
            <Firma label="Firma técnico" />
            <Firma label="Firma cliente / Conforme" />
          </div>

          <div style={{
            marginTop: 36, paddingTop: 16, borderTop: '1px solid #eee',
            fontSize: 9, color: '#bbb', textAlign: 'center', letterSpacing: '0.06em'
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
      <span style={{ fontSize: 11, color: '#999', minWidth: 70 }}>{label}:</span>
      <span style={{ fontSize: 11, color: '#111', fontWeight: 600 }}>{value ?? '—'}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: '#999', marginBottom: 8,
        borderBottom: '1px solid #eee', paddingBottom: 6
      }}>{title}</div>
      {children}
    </div>
  )
}

function Firma({ label }) {
  return (
    <div>
      <div style={{ borderBottom: '1.5px solid #000', marginBottom: 8, height: 48 }} />
      <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  )
}