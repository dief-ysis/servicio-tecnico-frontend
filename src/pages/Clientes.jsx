import { useState, useEffect, useCallback } from 'react'
import { getClientes, crearCliente, actualizarCliente } from '../api/clientes'
import { getEquipos } from '../api/equipos'
import EstadoBadge from '../components/EstadoBadge'
import { SkeletonTable } from '../components/Skeleton'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'

const inputStyle = {
  width: '100%', border: '0.5px solid var(--input-border)', borderRadius: 6,
  padding: '9px 11px', fontSize: 13, outline: 'none', background: 'var(--input-bg)'
}
const labelStyle = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 5 }

export default function Clientes() {
  const toast = useToast()
  const [clientes, setClientes] = useState([])
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [clienteDetalle, setClienteDetalle] = useState(null)

  const cargar = useCallback(() => {
    const params = {}
    if (buscar) params.buscar = buscar
    setLoading(true)
    getClientes(params).then(r => setClientes(r.data)).finally(() => setLoading(false))
  }, [buscar])

  useEffect(() => { cargar() }, [cargar])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>Clientes</h1>
        <button onClick={() => { setClienteEditando(null); setShowModal(true) }} style={{
          background: 'var(--primary)', border: 'none', borderRadius: 6,
          padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
        }}>
          + Nuevo cliente
        </button>
      </div>

      <input
        placeholder="Buscar por nombre o teléfono..."
        value={buscar} onChange={e => setBuscar(e.target.value)}
        style={{ ...inputStyle, maxWidth: 320, marginBottom: 18 }}
      />

      <div className="tabla-scroll">
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-table-head)' }}>
              {['Nombre', 'Teléfono', 'Email', 'Registrado', ''].map(h => (
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
              <SkeletonTable rows={5} cols={5} />
            ) : clientes.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>No hay clientes</td></tr>
            ) : clientes.map(c => (
              <tr key={c.id}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
                style={{ cursor: 'pointer' }}
              >
                <td onClick={() => setClienteDetalle(c)} style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, borderBottom: '0.5px solid var(--border-color)' }}>
                  {c.nombre}
                </td>
                <td onClick={() => setClienteDetalle(c)} style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>
                  {c.telefono ?? '—'}
                </td>
                <td onClick={() => setClienteDetalle(c)} style={{ padding: '11px 16px', fontSize: 13, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>
                  {c.email ?? '—'}
                </td>
                <td onClick={() => setClienteDetalle(c)} style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border-color)' }}>
                  {new Date(c.creado_en).toLocaleDateString('es-CL')}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                  <button onClick={() => { setClienteEditando(c); setShowModal(true) }} style={{
                    background: 'none', border: '0.5px solid var(--border)', borderRadius: 5,
                    padding: '4px 10px', fontSize: 11, color: 'var(--link)', cursor: 'pointer'
                  }}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalCliente
          cliente={clienteEditando}
          onClose={() => setShowModal(false)}
          onGuardado={() => { setShowModal(false); cargar() }}
        />
      )}

      {clienteDetalle && (
        <ModalDetalleCliente
          cliente={clienteDetalle}
          onClose={() => setClienteDetalle(null)}
        />
      )}
    </div>
  )
}

function ModalCliente({ cliente, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: cliente?.nombre ?? '',
    telefono: cliente?.telefono ?? '',
    email: cliente?.email ?? ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.nombre) { setError('El nombre es requerido'); return }
    setLoading(true)
    try {
      if (cliente) {
        await actualizarCliente(cliente.id, form)
      } else {
        await crearCliente(form)
      }
      toast(cliente ? 'Cliente actualizado' : 'Cliente registrado correctamente')
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 12, width: '100%',
        maxWidth: 420, padding: '28px 28px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>
            {cliente ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)' }}>×</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre *</label>
          <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Teléfono</label>
          <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
            style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Email</label>
          <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            style={inputStyle} />
        </div>

        {error && <div style={{ color: 'var(--danger-text)', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{
            background: 'none', border: '0.5px solid var(--border)', borderRadius: 6,
            padding: '9px 16px', fontSize: 13, cursor: 'pointer'
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: 'var(--primary)', border: 'none', borderRadius: 6,
            padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalDetalleCliente({ cliente, onClose }) {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getEquipos({ cliente_id: cliente.id }).then(r => setEquipos(r.data)).finally(() => setLoading(false))
  }, [cliente.id])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 12, width: '100%',
        maxWidth: 520, maxHeight: '85vh', overflow: 'auto', padding: '28px 28px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>{cliente.nombre}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)' }}>×</button>
        </div>

        <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-2)' }}>
          {cliente.telefono && <div style={{ marginBottom: 4 }}>Tel: {cliente.telefono}</div>}
          {cliente.email && <div>Email: {cliente.email}</div>}
        </div>

        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
          Historial de equipos ({equipos.length})
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Cargando...</div>
        ) : equipos.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Sin equipos registrados</div>
        ) : equipos.map(eq => (
          <div key={eq.id}
            onClick={() => { onClose(); navigate(`/equipos/${eq.id}`) }}
            style={{
              border: '0.5px solid var(--border-color)', borderRadius: 8, padding: '12px 14px',
              marginBottom: 8, cursor: 'pointer', transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--link)', marginBottom: 2 }}>
                  {eq.numero_ingreso}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {eq.marca} {eq.modelo || eq.tipo_equipo}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                  {eq.falla_reportada ?? '—'}
                </div>
              </div>
              <EstadoBadge estado={eq.estado_actual} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}