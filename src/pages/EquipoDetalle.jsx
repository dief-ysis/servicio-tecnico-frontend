import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEquipo, cambiarEstado, getHistorial, actualizarEquipo } from '../api/equipos'
import EstadoBadge from '../components/EstadoBadge'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { subirFoto } from '../api/equipos'

const ESTADOS = ['por_reparar', 'en_reparacion', 'espera_repuesto', 'reparado', 'irreparable', 'entregado']
const inputStyle = {
  width: '100%', border: '0.5px solid var(--input-border)', borderRadius: 6,
  padding: '9px 11px', fontSize: 13, outline: 'none', background: 'var(--input-bg)'
}
const labelStyle = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 5 }

const estadoConfig = {
  por_reparar:    { label: 'Por reparar',     bg: 'var(--warning-bg)',   color: 'var(--warning-text)',  border: '#e6d060' },
  en_reparacion:  { label: 'En reparación',   bg: 'var(--info-bg)',      color: 'var(--info-text)',     border: '#a0c0e8' },
  espera_repuesto:{ label: 'Espera repuesto', bg: '#f5eafd',             color: '#6b2fa0',              border: '#c9a0e8' },
  reparado:       { label: 'Reparado',        bg: 'var(--success-bg)',   color: 'var(--success-text)',  border: '#a8cc80' },
  irreparable:    { label: 'Irreparable',     bg: 'var(--danger-bg)',    color: 'var(--danger-text)',   border: '#e8a0a0' },
  entregado:      { label: 'Entregado',       bg: 'var(--border-color)', color: 'var(--text-2)',        border: 'var(--border-color)' },
}

export default function EquipoDetalle() {
  const toast = useToast()
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [equipo, setEquipo] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)

  const cargar = () => {
    Promise.all([getEquipo(id), getHistorial(id)]).then(([eq, hist]) => {
      setEquipo(eq.data)
      setForm({
        diagnostico: eq.data.diagnostico ?? '',
        observaciones: eq.data.observaciones ?? '',
        accesorios: eq.data.accesorios ?? '',
        notas_tecnico: eq.data.notas_tecnico ?? '',
        costo_reparacion: eq.data.costo_reparacion ?? '',
      })
      setHistorial(hist.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [id])

  const [estadoPendiente, setEstadoPendiente] = useState(null)

  const handleEstado = async (estado) => {
    if (estado === 'irreparable' || estado === 'entregado') {
      setEstadoPendiente(estado)
      return
    }
    await aplicarEstado(estado)
  }

  const aplicarEstado = async (estado) => {
    await cambiarEstado(id, estado)
    toast(`Estado actualizado a ${estado.replace(/_/g, ' ')}`)
    setEstadoPendiente(null)
    cargar()
  }

  const handleGuardar = async () => {
    setGuardando(true)
    await actualizarEquipo(id, form)
    toast('Cambios guardados')
    setEditando(false)
    setGuardando(false)
    cargar()
  }

  const handleFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true)
    try {
      const res = await subirFoto(id, file)
      toast('Foto subida correctamente')
      cargar()
    } catch {
      toast('Error al subir la foto', 'error')
    } finally {
      setSubiendo(false)
    }
  }

  const formatFecha = (iso) => iso ? new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—'

  if (loading) return <div style={{ color: 'var(--text-3)' }}>Cargando...</div>
  if (!equipo) return <div>Equipo no encontrado</div>

  return (
    <div>
      <button onClick={() => navigate('/equipos')} style={{
        background: 'none', border: 'none', color: 'var(--link)',
        fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0
      }}>
        ← Volver a equipos
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--link)', marginBottom: 4 }}>
            {equipo.numero_ingreso}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>
            {equipo.marca} {equipo.modelo || equipo.tipo_equipo}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <EstadoBadge estado={equipo.estado_actual} />
          <button onClick={() => navigate(`/equipos/${id}/orden`)} style={{
            background: 'var(--black)', color: 'var(--primary)', border: 'none',
            borderRadius: 4, padding: '6px 14px', fontSize: 10,
            fontWeight: 900, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer'
          }}>
            Imprimir orden
          </button>
        </div>
      </div>

      <div className="detalle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Datos del cliente</div>
          <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre</span>: <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{equipo.cliente_nombre}</span></div>
          <div style={{ fontSize: 13 }}><span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teléfono</span>: <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{equipo.cliente_telefono ?? '—'}</span></div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Datos del equipo</div>
          <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tipo</span>: <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{equipo.tipo_equipo}</span></div>
          <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Marca/Modelo</span>: <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{equipo.marca} {equipo.modelo}</span></div>
          <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>N° de serie</span>: <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{equipo.password_pin ?? '—'}</span></div>
          <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Accesorios</span>: <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{equipo.accesorios ?? '—'}</span></div>
          <div style={{ fontSize: 13 }}><span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ingreso</span>: <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{formatFecha(equipo.fecha_ingreso)}</span></div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border-color)',
        borderLeft: '4px solid var(--primary)',
        borderRadius: 10, padding: '18px 20px', marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Diagnóstico y notas
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Notas internas del técnico</label>
              {editando ? (
                <textarea value={form.notas_tecnico}
                  onChange={e => setForm(p => ({ ...p, notas_tecnico: e.target.value }))}
                  rows={2} placeholder="falta repuesto, cliente llamó, revisar fuente..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-1)', padding: '8px 0' }}>
                  {equipo.notas_tecnico
                    ? <span style={{
                        background: 'var(--warning-bg)', border: '1px solid var(--warning-text)',
                        borderRadius: 4, padding: '6px 10px', display: 'inline-block',
                        fontSize: 12, color: 'var(--warning-text)'
                      }}>{equipo.notas_tecnico}</span>
                    : '—'}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Costo de reparación</label>
              {editando ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>$</span>
                  <input
                    type="number" min="0" step="100"
                    value={form.costo_reparacion}
                    onChange={e => setForm(p => ({ ...p, costo_reparacion: e.target.value }))}
                    style={{ ...inputStyle, maxWidth: 160 }}
                    placeholder="0"
                  />
                </div>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-1)', padding: '8px 0' }}>
                  {equipo.costo_reparacion
                    ? `$${Number(equipo.costo_reparacion).toLocaleString('es-CL')}`
                    : '—'}
                </div>
              )}
            </div>
          </div>
          {usuario.rol === 'tecnico' && (
            <button onClick={() => editando ? handleGuardar() : setEditando(true)} style={{
              background: editando ? 'var(--primary)' : 'none',
              border: '0.5px solid var(--border)', borderRadius: 6,
              padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}>
              {guardando ? 'Guardando...' : editando ? 'Guardar' : 'Editar'}
            </button>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Falla reportada</label>
          <div style={{ fontSize: 13, color: 'var(--text-1)', padding: '8px 0' }}>
            {equipo.falla_reportada ?? '—'}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Diagnóstico técnico</label>
          {editando ? (
            <textarea value={form.diagnostico} onChange={e => setForm(p => ({ ...p, diagnostico: e.target.value }))}
              rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-1)', padding: '8px 0' }}>{equipo.diagnostico ?? '—'}</div>
          )}
        </div>
        <div>
          <label style={labelStyle}>Observaciones internas</label>
          {editando ? (
            <textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
              rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-1)', padding: '8px 0' }}>{equipo.observaciones ?? '—'}</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        {equipo.foto_url ? (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Foto del equipo
            </div>
            <img
              src={equipo.foto_url}
              alt="Foto del equipo"
              style={{ width: '100%', borderRadius: 6, border: '1px solid var(--border-color)', cursor: 'pointer' }}
              onClick={() => window.open(equipo.foto_url, '_blank')}
            />
          </div>
        ) : (
          <label style={{ cursor: 'pointer' }}>
            <div style={{
              border: '1px dashed var(--border)', borderRadius: 6, padding: '20px',
              textAlign: 'center', color: 'var(--text-3)', fontSize: 12
            }}>
              {subiendo ? 'Subiendo...' : '+ Agregar foto del equipo'}
            </div>
            <input
              type="file" accept="image/*" capture="environment"
              onChange={handleFoto} style={{ display: 'none' }}
              disabled={subiendo}
            />
          </label>
        )}
      </div>

      {usuario.rol === 'tecnico' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 10, padding: '18px 20px', marginBottom: 16
        }}>
          <div style={{
            fontWeight: 900, fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 14, color: 'var(--text-3)'
          }}>Cambiar estado</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ESTADOS.map(estado => {
              const cfg = estadoConfig[estado]
              const isActive = estado === equipo.estado_actual
              return (
                <button key={estado} onClick={() => handleEstado(estado)}
                  disabled={isActive}
                  style={{
                    background: isActive ? cfg.bg : 'var(--bg-main)',
                    border: `1px solid ${isActive ? cfg.border : 'var(--border-color)'}`,
                    borderRadius: 4, padding: '7px 14px',
                    fontSize: 10, fontWeight: isActive ? 900 : 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: isActive ? cfg.color : 'var(--text-2)',
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = cfg.bg
                      e.currentTarget.style.color = cfg.color
                      e.currentTarget.style.borderColor = cfg.border
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-main)'
                      e.currentTarget.style.color = 'var(--text-2)'
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }
                  }}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {estadoPendiente && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 6, padding: '28px 28px 24px',
            width: '100%', maxWidth: 380, border: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
              color: estadoPendiente === 'irreparable' ? 'var(--danger-text)' : 'var(--success-text)'
            }}>
              {estadoPendiente === 'irreparable' ? '⚠ Confirmar irreparable' : '✓ Confirmar entrega'}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6, marginBottom: 20 }}>
              {estadoPendiente === 'irreparable'
                ? `¿Confirmas que el equipo ${equipo.numero_ingreso} no tiene reparación posible? Esta acción quedará registrada en el historial.`
                : `¿Confirmas que el equipo ${equipo.numero_ingreso} fue entregado al cliente ${equipo.cliente_nombre}? Se registrará la fecha de entrega.`
              }
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEstadoPendiente(null)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
                padding: '9px 16px', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer'
              }}>
                Cancelar
              </button>
              <button onClick={() => aplicarEstado(estadoPendiente)} style={{
                background: estadoPendiente === 'irreparable' ? 'var(--danger)' : 'var(--black)',
                color: estadoPendiente === 'irreparable' ? 'var(--white)' : 'var(--primary)',
                border: 'none', borderRadius: 4,
                padding: '9px 18px', fontSize: 11, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer'
              }}>
                {estadoPendiente === 'irreparable' ? 'Confirmar' : 'Confirmar entrega'}
              </button>
            </div>
          </div>
        </div>
      )}

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden', marginTop: 14 }}>
          <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border-color)', fontWeight: 700, fontSize: 13 }}>
            Historial de cambios
          </div>
          {historial.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin historial</div>
          ) : historial.map(h => (
            <div key={h.id} style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: 'var(--primary)',
                  textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  {h.campo_modificado.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 8px' }}>
                  {h.valor_anterior ?? 'vacío'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>→</span>
                <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600, marginLeft: 8 }}>
                  {h.valor_nuevo}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>{h.usuario_nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatFecha(h.fecha_cambio)}</div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}