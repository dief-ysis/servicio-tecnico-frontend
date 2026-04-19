import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEquipos, crearEquipo } from '../api/equipos'
import { upsertClienteBsale } from '../api/clientes'
import EstadoBadge from '../components/EstadoBadge'
import { SkeletonTable } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { exportarEquipos } from '../utils/exportExcel'
import { useIsMobile } from '../hooks/useIsMobile'
import { buscarClientesBsale } from '../api/equipos'

const ESTADOS = ['por_reparar', 'en_reparacion', 'espera_repuesto', 'reparado', 'irreparable', 'entregado']
const ESTADOS_LABELS = {
  '': 'Todos',
  por_reparar: 'Por reparar',
  en_reparacion: 'En reparación',
  espera_repuesto: 'Espera repuesto',
  reparado: 'Reparado',
  irreparable: 'Irreparable',
  entregado: 'Entregado'
}

const inputStyle = {
  width: '100%',
  border: '1px solid var(--input-border)',
  borderRadius: 6,
  padding: '9px 11px',
  fontSize: 13,
  outline: 'none',
  background: 'var(--input-bg)',
  color: 'var(--text-1)'
}

const labelStyle = {
  fontSize: 11, fontWeight: 700,
  color: 'var(--text-2)',
  display: 'block', marginBottom: 5,
  textTransform: 'uppercase', letterSpacing: '0.06em'
}

export default function Equipos() {
  const toast = useToast()
  const { isMobile, isSmall } = useIsMobile()
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [buscar, setBuscar] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  
  const cargar = useCallback(async () => {
    const params = {}
    if (filtroEstado) params.estado = filtroEstado
    if (buscar) params.buscar = buscar
    if (fechaDesde) params.fecha_desde = fechaDesde
    if (fechaHasta) params.fecha_hasta = fechaHasta
    setLoading(true)
    try {
      const r = await getEquipos(params)
      setEquipos(r.data.data ?? r.data)
    } catch {
      toast('Error al cargar equipos', 'error')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, buscar, fechaDesde, fechaHasta, toast])

  useEffect(() => {
    const load = async () => { await cargar() }
    load()
  }, [cargar])

  const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: '2-digit'
  })

  return (
    <div>
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center',
        marginBottom: 24, gap: isMobile ? 12 : 0
      }}>
        <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900,
          color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Equipos
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportarEquipos(equipos)} style={{
            flex: isMobile ? 1 : 'none',
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 4, padding: '9px 16px', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.06em', cursor: 'pointer', color: 'var(--text-1)',
            textTransform: 'uppercase'
          }}>
            {isSmall ? 'Excel' : 'Exportar Excel'}
          </button>
          <button onClick={() => setShowModal(true)} style={{
            flex: isMobile ? 1 : 'none',
            background: '#ffcd0d', border: 'none', borderRadius: 4,
            padding: '9px 18px', fontSize: 11, fontWeight: 900,
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer'
          }}>
            {isSmall ? '+ Ingreso' : '+ Nuevo ingreso'}
          </button>
        </div>
      </div>

      <div className="filtros-grid" style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          placeholder="Buscar por cliente, N° ingreso o marca..."
          value={buscar} onChange={e => setBuscar(e.target.value)}
          style={{ ...inputStyle, maxWidth: 320 }}
        />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={{ ...inputStyle, width: 160 }}>
          {['', ...ESTADOS].map(e => (
            <option key={e} value={e}>{ESTADOS_LABELS[e]}</option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap'
          }}>Desde</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            style={{ ...inputStyle, width: 140 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap'
          }}>Hasta</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            style={{ ...inputStyle, width: 140 }}
          />
        </div>
        {(fechaDesde || fechaHasta) && (
          <button
            onClick={() => { setFechaDesde(''); setFechaHasta('') }}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 4,
              padding: '8px 12px', fontSize: 10, fontWeight: 800,
              color: 'var(--text-3)', cursor: 'pointer', letterSpacing: '0.06em',
              textTransform: 'uppercase', whiteSpace: 'nowrap'
            }}>
            Limpiar fechas
          </button>
        )}
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13, padding: 16 }}>Cargando...</div>
          ) : equipos.length === 0 ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13, padding: 16, textAlign: 'center' }}>
              No hay equipos
            </div>
          ) : equipos.map(eq => (
            <div key={eq.id}
              onClick={() => navigate(`/equipos/${eq.id}`)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 8, padding: '14px 16px', cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#334862', fontWeight: 700 }}>
                  {eq.numero_ingreso}
                </span>
                <EstadoBadge estado={eq.estado_actual} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
                {eq.cliente_nombre}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
                {eq.tipo_equipo} · {eq.marca} {eq.modelo}
              </div>
              {eq.falla_reportada && (
                <div style={{
                  fontSize: 11, color: 'var(--text-3)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {eq.falla_reportada}
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                {new Date(eq.fecha_ingreso).toLocaleDateString('es-CL', {
                  day: '2-digit', month: 'short', year: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tabla-scroll">
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-table-head)' }}>
                  {['N° Ingreso', 'Cliente', 'Equipo', 'Falla', 'Estado', 'Ingreso', ''].map(h => (
                    <th key={h} style={{
                      padding: '9px 16px', textAlign: 'left', fontSize: 11,
                      color: 'var(--text-3)', fontWeight: 600, borderBottom: '0.5px solid var(--border-color)',
                      letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonTable rows={5} cols={7} />
                ) : equipos.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>No hay equipos</td></tr>
                ) : equipos.map(eq => (
                  <tr key={eq.id}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>
                      {eq.numero_ingreso}
                    </td>
                    <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>
                      <div>{eq.cliente_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{eq.cliente_telefono}</div>
                    </td>
                    <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>
                      <div>{eq.tipo_equipo}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{eq.marca} {eq.modelo}</div>
                    </td>
                    <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-2)', borderBottom: '0.5px solid var(--border-color)', maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {eq.falla_reportada ?? '—'}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                      <EstadoBadge estado={eq.estado_actual} />
                    </td>
                    <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border-color)' }}>
                      {formatFecha(eq.fecha_ingreso)}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                      <button onClick={() => navigate(`/equipos/${eq.id}`)} style={{
                        background: 'none', border: '0.5px solid var(--border)', borderRadius: 5,
                        padding: '4px 10px', fontSize: 11, color: 'var(--link)', cursor: 'pointer'
                      }}>
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ModalNuevoEquipo
          onClose={() => setShowModal(false)}
          onCreado={() => { setShowModal(false); cargar() }}
        />
      )}
    </div>
  )
}

function ModalNuevoEquipo({ onClose, onCreado }) {
  const toast = useToast()
  const { isMobile } = useIsMobile()
  const [step, setStep] = useState(1)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [equipo, setEquipo] = useState({
    tipo_equipo: '', marca: '', modelo: '',
    falla_reportada: '', accesorios: '', observaciones: '', password_pin: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientesBsale, setClientesBsale] = useState([])
  const [busquedaBsale, setBusquedaBsale] = useState(false)
  const [seleccionandoBsale, setSeleccionandoBsale] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!equipo.tipo_equipo) { setError('El tipo de equipo es requerido'); return }
    setLoading(true)
    try {
      await crearEquipo({ ...equipo, cliente_id: clienteSeleccionado.id })
      toast('Equipo registrado correctamente')
      onCreado()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al crear equipo')
    } finally {
      setLoading(false)
    }
  }

  const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 999,
    padding: isMobile ? 0 : '20px'
  }

  const modalStyle = {
    background: 'var(--bg-card)',
    borderRadius: isMobile ? 0 : 10,
    width: '100%',
    maxWidth: isMobile ? '100%' : 520,
    maxHeight: isMobile ? '100vh' : '90vh',
    height: isMobile ? '100%' : 'auto',
    overflow: 'auto',
    padding: '28px 28px 24px'
  }

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modalStyle, color: 'var(--text-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>
            {step === 1 ? 'Paso 1 — Cliente' : 'Paso 2 — Equipo'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)' }}>×</button>
        </div>

        {step === 1 && (
          <div>
            <label style={labelStyle}>Buscar cliente en Bsale</label>
            <input
              placeholder="Nombre, empresa o RUT..."
              autoFocus
              onChange={async (e) => {
                const q = e.target.value
                if (q.length >= 2) {
                  setBusquedaBsale(true)
                  setClienteSeleccionado(null)
                  try {
                    const r = await buscarClientesBsale(q)
                    setClientesBsale(r.data)
                  } catch {
                    setClientesBsale([])
                  } finally {
                    setBusquedaBsale(false)
                  }
                } else {
                  setClientesBsale([])
                }
              }}
              style={inputStyle}
            />

            {busquedaBsale && (
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>Buscando en Bsale...</div>
            )}

            {clientesBsale.length > 0 && !clienteSeleccionado && (
              <div style={{
                border: '1px solid var(--border-color)', borderRadius: 6,
                marginTop: 6, overflow: 'hidden'
              }}>
                {clientesBsale.map(c => (
                  <div key={c.id}
                    onClick={async () => {
                      setSeleccionandoBsale(true)
                      try {
                        const r = await upsertClienteBsale({
                          bsale_id: c.id,
                          nombre:   c.nombre,
                          telefono: c.phone ?? null,
                          email:    c.email ?? null
                        })
                        setClienteSeleccionado(r.data)
                        setClientesBsale([])
                      } catch {
                        setError('Error al sincronizar cliente de Bsale')
                      } finally {
                        setSeleccionandoBsale(false)
                      }
                    }}
                    style={{
                      padding: '10px 12px', cursor: 'pointer', fontSize: 13,
                      borderBottom: '1px solid var(--border-color)',
                      background: 'var(--bg-card)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {c.code && <span>RUT: {c.code}</span>}
                      {c.phone && <span style={{ marginLeft: 8 }}>{c.phone}</span>}
                      {c.email && <span style={{ marginLeft: 8, color: 'var(--link)' }}>{c.email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {seleccionandoBsale && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>Sincronizando cliente...</div>
            )}

            {clienteSeleccionado && (
              <div style={{
                background: 'var(--success-bg)', border: '1px solid #a8cc80',
                borderRadius: 6, padding: '12px 14px', marginTop: 10
              }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--success-text)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  ✓ Cliente seleccionado
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>
                  {clienteSeleccionado.nombre}
                </div>
                {clienteSeleccionado.telefono && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {clienteSeleccionado.telefono}
                  </div>
                )}
                <button onClick={() => setClienteSeleccionado(null)} style={{
                  marginTop: 8, background: 'none', border: 'none',
                  fontSize: 11, color: 'var(--success-text)', cursor: 'pointer',
                  padding: 0, textDecoration: 'underline'
                }}>
                  Cambiar cliente
                </button>
              </div>
            )}

            {error && <div style={{ color: 'var(--danger-text)', fontSize: 12, marginTop: 10 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => { setError(''); setStep(2) }}
                disabled={!clienteSeleccionado}
                style={{
                  background: 'var(--primary)', border: 'none', borderRadius: 6,
                  padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  opacity: !clienteSeleccionado ? 0.4 : 1
                }}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Tipo de equipo *</label>
                <input value={equipo.tipo_equipo} onChange={e => setEquipo(p => ({ ...p, tipo_equipo: e.target.value }))}
                  style={inputStyle} placeholder="parled, cabeza móvil, barra led..." autoFocus />
              </div>
              <div>
                <label style={labelStyle}>Marca</label>
                <input value={equipo.marca} onChange={e => setEquipo(p => ({ ...p, marca: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Modelo</label>
                <input value={equipo.modelo} onChange={e => setEquipo(p => ({ ...p, modelo: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>N° de serie</label>
                <input value={equipo.password_pin} onChange={e => setEquipo(p => ({ ...p, password_pin: e.target.value }))}
                  style={inputStyle} placeholder="opcional" />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Falla reportada</label>
              <textarea value={equipo.falla_reportada} onChange={e => setEquipo(p => ({ ...p, falla_reportada: e.target.value }))}
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Accesorios que ingresan</label>
              <input value={equipo.accesorios} onChange={e => setEquipo(p => ({ ...p, accesorios: e.target.value }))} style={inputStyle} placeholder="cargador, funda, mouse..." />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea value={equipo.observaciones} onChange={e => setEquipo(p => ({ ...p, observaciones: e.target.value }))}
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {error && <div style={{ color: 'var(--danger-text)', fontSize: 12, marginTop: 4 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => setStep(1)} style={{
                background: 'none', border: '0.5px solid var(--border)', borderRadius: 6,
                padding: '9px 16px', fontSize: 13, cursor: 'pointer'
              }}>← Volver</button>
              <button onClick={handleSubmit} disabled={loading} style={{
                background: 'var(--primary)', border: 'none', borderRadius: 6,
                padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}>
                {loading ? 'Guardando...' : 'Registrar equipo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}