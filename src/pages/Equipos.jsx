import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEquipos, crearEquipo } from '../api/equipos'
import { getClientes, crearCliente } from '../api/clientes'
import EstadoBadge from '../components/EstadoBadge'
import { SkeletonTable } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { exportarEquipos } from '../utils/exportExcel'

const ESTADOS = ['', 'por_reparar', 'en_reparacion', 'reparado', 'irreparable', 'entregado']
const ESTADOS_LABELS = {
  '': 'Todos', por_reparar: 'Por reparar', en_reparacion: 'En reparación',
  reparado: 'Reparado', irreparable: 'Irreparable', entregado: 'Entregado'
}

const inputStyle = {
  width: '100%', border: '0.5px solid #ddd', borderRadius: 6,
  padding: '9px 11px', fontSize: 13, outline: 'none', background: '#fff'
}
const labelStyle = { fontSize: 12, color: '#666', display: 'block', marginBottom: 5 }

export default function Equipos() {
  const toast = useToast()
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
      setEquipos(r.data)
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
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => exportarEquipos(equipos)} style={{
          background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4,
          padding: '9px 16px', fontSize: 11, fontWeight: 800,
          letterSpacing: '0.06em', cursor: 'pointer', color: '#333',
          textTransform: 'uppercase'
        }}>
          Exportar Excel
        </button>
        <button onClick={() => setShowModal(true)} style={{
          background: '#ffcd0d', border: 'none', borderRadius: 4,
          padding: '9px 18px', fontSize: 11, fontWeight: 900,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer'
        }}>
          + Nuevo ingreso
        </button>
      </div>

      <div className="filtros-grid" style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          placeholder="Buscar por cliente, N° ingreso o marca..."
          value={buscar} onChange={e => setBuscar(e.target.value)}
          style={{ ...inputStyle, maxWidth: 320 }}
        />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={{ ...inputStyle, width: 160 }}>
          {ESTADOS.map(e => (
            <option key={e} value={e}>{ESTADOS_LABELS[e]}</option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, color: '#999',
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
            fontSize: 10, fontWeight: 800, color: '#999',
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
              background: 'none', border: '1px solid #ddd', borderRadius: 4,
              padding: '8px 12px', fontSize: 10, fontWeight: 800,
              color: '#999', cursor: 'pointer', letterSpacing: '0.06em',
              textTransform: 'uppercase', whiteSpace: 'nowrap'
            }}>
            Limpiar fechas
          </button>
        )}
      </div>

      <div className="tabla-scroll">
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['N° Ingreso', 'Cliente', 'Equipo', 'Falla', 'Estado', 'Ingreso', ''].map(h => (
                <th key={h} style={{
                  padding: '9px 16px', textAlign: 'left', fontSize: 11,
                  color: '#888', fontWeight: 600, borderBottom: '0.5px solid #eee',
                  letterSpacing: '0.05em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTable rows={5} cols={7} />
            ) : equipos.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#888' }}>No hay equipos</td></tr>
            ) : equipos.map(eq => (
              <tr key={eq.id}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
                style={{ cursor: 'pointer' }}
              >
                <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 12, color: '#334862', borderBottom: '0.5px solid #f5f5f5' }}>
                  {eq.numero_ingreso}
                </td>
                <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid #f5f5f5' }}>
                  <div>{eq.cliente_nombre}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{eq.cliente_telefono}</div>
                </td>
                <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid #f5f5f5' }}>
                  <div>{eq.tipo_equipo}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{eq.marca} {eq.modelo}</div>
                </td>
                <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 12, color: '#666', borderBottom: '0.5px solid #f5f5f5', maxWidth: 160 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eq.falla_reportada ?? '—'}
                  </div>
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid #f5f5f5' }}>
                  <EstadoBadge estado={eq.estado_actual} />
                </td>
                <td onClick={() => navigate(`/equipos/${eq.id}`)} style={{ padding: '11px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f5f5' }}>
                  {formatFecha(eq.fecha_ingreso)}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid #f5f5f5' }}>
                  <button onClick={() => navigate(`/equipos/${eq.id}`)} style={{
                    background: 'none', border: '0.5px solid #ddd', borderRadius: 5,
                    padding: '4px 10px', fontSize: 11, color: '#334862', cursor: 'pointer'
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
  const [step, setStep] = useState(1)
  const [clientes, setClientes] = useState([])
  const [buscarCliente, setBuscarCliente] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '' })
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false)
  const [equipo, setEquipo] = useState({
    tipo_equipo: '', marca: '', modelo: '',
    falla_reportada: '', accesorios: '', observaciones: '', password_pin: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (buscarCliente.length >= 2) {
      getClientes({ buscar: buscarCliente }).then(r => setClientes(r.data))
    } else {
      setClientes([])
    }
  }, [buscarCliente])

  const handleSubmit = async () => {
    setError('')
    if (!equipo.tipo_equipo) { setError('El tipo de equipo es requerido'); return }
    setLoading(true)
    try {
      let cliente_id = clienteSeleccionado?.id
      if (modoNuevoCliente) {
        if (!nuevoCliente.nombre) { setError('El nombre del cliente es requerido'); setLoading(false); return }
        const r = await crearCliente(nuevoCliente)
        cliente_id = r.data.id
      }
      await crearEquipo({ ...equipo, cliente_id })
      toast('Equipo registrado correctamente')
      onCreado()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al crear equipo')
    } finally {
      setLoading(false)
    }
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
  }
  const modalStyle = {
    background: '#fff', borderRadius: 12, width: '100%', maxWidth: 500,
    maxHeight: '90vh', overflow: 'auto', padding: '28px 28px 24px'
  }

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>
            {step === 1 ? 'Paso 1 — Cliente' : 'Paso 2 — Equipo'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        {step === 1 && (
          <div>
            {!modoNuevoCliente ? (
              <>
                <label style={labelStyle}>Buscar cliente existente</label>
                <input
                  placeholder="Nombre o teléfono..."
                  value={buscarCliente}
                  onChange={e => { setBuscarCliente(e.target.value); setClienteSeleccionado(null) }}
                  style={inputStyle}
                  autoFocus
                />
                {clientes.length > 0 && (
                  <div style={{ border: '0.5px solid #ddd', borderRadius: 6, marginTop: 4, overflow: 'hidden' }}>
                    {clientes.map(c => (
                      <div key={c.id} onClick={() => { setClienteSeleccionado(c); setClientes([]) }}
                        style={{
                          padding: '10px 12px', cursor: 'pointer', fontSize: 13,
                          borderBottom: '0.5px solid #f0f0f0',
                          background: clienteSeleccionado?.id === c.id ? '#fff8d6' : '#fff'
                        }}>
                        <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{c.telefono}</div>
                      </div>
                    ))}
                  </div>
                )}
                {clienteSeleccionado && (
                  <div style={{ background: '#eaf3de', borderRadius: 6, padding: '10px 12px', marginTop: 8, fontSize: 13 }}>
                    ✓ <strong>{clienteSeleccionado.nombre}</strong> — {clienteSeleccionado.telefono}
                  </div>
                )}
                <button onClick={() => setModoNuevoCliente(true)} style={{
                  marginTop: 14, background: 'none', border: '0.5px solid #ddd',
                  borderRadius: 6, padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: '#334862'
                }}>
                  + Registrar cliente nuevo
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Nombre *</label>
                  <input value={nuevoCliente.nombre} onChange={e => setNuevoCliente(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} autoFocus />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Teléfono</label>
                  <input value={nuevoCliente.telefono} onChange={e => setNuevoCliente(p => ({ ...p, telefono: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email</label>
                  <input value={nuevoCliente.email} onChange={e => setNuevoCliente(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                </div>
                <button onClick={() => setModoNuevoCliente(false)} style={{
                  background: 'none', border: 'none', fontSize: 12, color: '#888', cursor: 'pointer', padding: 0
                }}>
                  ← Buscar cliente existente
                </button>
              </>
            )}

            {error && <div style={{ color: '#8a0000', fontSize: 12, marginTop: 10 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => { setError(''); setStep(2) }}
                disabled={!clienteSeleccionado && !modoNuevoCliente}
                style={{
                  background: '#ffcd0d', border: 'none', borderRadius: 6,
                  padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  opacity: (!clienteSeleccionado && !modoNuevoCliente) ? 0.4 : 1
                }}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
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

            {error && <div style={{ color: '#8a0000', fontSize: 12, marginTop: 4 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => setStep(1)} style={{
                background: 'none', border: '0.5px solid #ddd', borderRadius: 6,
                padding: '9px 16px', fontSize: 13, cursor: 'pointer'
              }}>← Volver</button>
              <button onClick={handleSubmit} disabled={loading} style={{
                background: '#ffcd0d', border: 'none', borderRadius: 6,
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