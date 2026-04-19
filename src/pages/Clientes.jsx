import { useState, useEffect, useCallback, useRef } from 'react'
import { getClientesBsale, getEquiposPorBsaleId } from '../api/clientes'
import EstadoBadge from '../components/EstadoBadge'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { useIsMobile } from '../hooks/useIsMobile'

const inputStyle = {
  width: '100%', border: '1px solid var(--input-border)', borderRadius: 4,
  padding: '9px 11px', fontSize: 13, outline: 'none',
  background: 'var(--input-bg)', color: 'var(--text-1)'
}

const LIMITE = 25

export default function Clientes() {
  const toast = useToast()
  const { isMobile } = useIsMobile()
  const [clientes, setClientes] = useState([])
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [clienteDetalle, setClienteDetalle] = useState(null)
  const debounceRef = useRef(null)

  const cargar = useCallback(async (texto, off) => {
    setLoading(true)
    try {
      const r = await getClientesBsale({ limite: LIMITE, offset: off, buscar: texto })
      setClientes(r.data.data)
      setTotal(r.data.total)
    } catch {
      toast('Error al cargar clientes de Bsale', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { cargar(buscar, offset) }, [offset])

  // Debounce en búsqueda — no busca con cada tecla
  const handleBuscar = (val) => {
    setBuscar(val)
    setOffset(0)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => cargar(val, 0), 350)
  }

  const pagina = Math.floor(offset / LIMITE) + 1
  const paginas = Math.max(1, Math.ceil(total / LIMITE))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>Clientes</h1>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Clientes de Bsale — {total.toLocaleString('es-CL')} en total
          </div>
        </div>
      </div>

      <input
        placeholder="Buscar por nombre, empresa o RUT..."
        value={buscar}
        onChange={e => handleBuscar(e.target.value)}
        style={{ ...inputStyle, maxWidth: 360, marginBottom: 18 }}
      />

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13, padding: 16 }}>Cargando...</div>
          ) : clientes.length === 0 ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13, padding: 16, textAlign: 'center' }}>
              No hay clientes
            </div>
          ) : clientes.map(c => (
            <div key={c.id}
              onClick={() => setClienteDetalle(c)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 8, padding: '14px 16px', cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>
                {c.nombre}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                {c.code && `RUT: ${c.code}`}
                {c.phone && ` · ${c.phone}`}
              </div>
              {c.total_equipos > 0 && (
                <div style={{ fontSize: 11, color: 'var(--link)', marginTop: 4 }}>
                  {c.total_equipos} equipo{c.total_equipos > 1 ? 's' : ''} registrado{c.total_equipos > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="tabla-scroll">
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-table-head)' }}>
                  {['Nombre / Empresa', 'RUT', 'Teléfono', 'Email', 'Equipos', ''].map(h => (
                    <th key={h} style={{
                      padding: '9px 16px', textAlign: 'left', fontSize: 11,
                      color: 'var(--text-3)', fontWeight: 600,
                      borderBottom: '0.5px solid var(--border-color)',
                      letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>
                    Cargando clientes de Bsale...
                  </td></tr>
                ) : clientes.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>
                    No hay clientes
                  </td></tr>
                ) : clientes.map(c => (
                  <tr key={c.id}
                    onClick={() => setClienteDetalle(c)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, borderBottom: '0.5px solid var(--border-color)' }}>
                      {c.nombre}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-2)', borderBottom: '0.5px solid var(--border-color)' }}>
                      {c.code ?? '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, borderBottom: '0.5px solid var(--border-color)' }}>
                      {c.phone ?? '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>
                      {c.email ?? '—'}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                      {c.total_equipos > 0 ? (
                        <span style={{
                          background: 'var(--info-bg)', color: 'var(--info-text)',
                          borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700
                        }}>
                          {c.total_equipos}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                      <span style={{ fontSize: 11, color: 'var(--link)', fontWeight: 700 }}>Ver →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación — solo cuando no hay búsqueda activa */}
      {!buscar && paginas > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - LIMITE))}
            style={{
              background: offset === 0 ? 'var(--bg-card)' : 'var(--primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 4, padding: '7px 16px', fontSize: 12, fontWeight: 700,
              cursor: offset === 0 ? 'default' : 'pointer', color: '#000',
              opacity: offset === 0 ? 0.35 : 1
            }}>
            ← Anterior
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 200, textAlign: 'center' }}>
            Página {pagina} de {paginas} · {total.toLocaleString('es-CL')} clientes
          </span>
          <button
            disabled={offset + LIMITE >= total}
            onClick={() => setOffset(offset + LIMITE)}
            style={{
              background: offset + LIMITE >= total ? 'var(--bg-card)' : 'var(--primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 4, padding: '7px 16px', fontSize: 12, fontWeight: 700,
              cursor: offset + LIMITE >= total ? 'default' : 'pointer', color: '#000',
              opacity: offset + LIMITE >= total ? 0.35 : 1
            }}>
            Siguiente →
          </button>
        </div>
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

function ModalDetalleCliente({ cliente, onClose }) {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const { isMobile } = useIsMobile()
  const navigate = useNavigate()

  useEffect(() => {
    getEquiposPorBsaleId(cliente.id)
      .then(r => setEquipos(r.data))
      .catch(() => setEquipos([]))
      .finally(() => setLoading(false))
  }, [cliente.id])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 999,
      overflowY: isMobile ? 'auto' : 'hidden'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: isMobile ? 0 : 12, width: '100%',
        maxWidth: isMobile ? '100%' : 540, height: isMobile ? '100%' : 'auto',
        maxHeight: isMobile ? '100%' : '90vh', padding: isMobile ? '24px 20px' : '28px 28px 24px',
        margin: isMobile ? 0 : 'auto', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{cliente.nombre}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)' }}>×</button>
        </div>

        <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {cliente.code  && <div>RUT: <strong style={{ color: 'var(--text-1)' }}>{cliente.code}</strong></div>}
          {cliente.phone && <div>Tel: <strong style={{ color: 'var(--text-1)' }}>{cliente.phone}</strong></div>}
          {cliente.email && <div>Email: <a href={`mailto:${cliente.email}`} style={{ color: 'var(--link)' }}>{cliente.email}</a></div>}
        </div>

        <div style={{
          fontWeight: 700, fontSize: 12, marginBottom: 12,
          textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)'
        }}>
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
              border: '0.5px solid var(--border-color)', borderRadius: 8,
              padding: '12px 14px', marginBottom: 8, cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--link)', marginBottom: 2 }}>
                  {eq.numero_ingreso}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                  {eq.marca} {eq.modelo || eq.tipo_equipo}
                </div>
                {eq.falla_reportada && (
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {eq.falla_reportada}
                  </div>
                )}
                {eq.costo_reparacion && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>
                    ${Number(eq.costo_reparacion).toLocaleString('es-CL')}
                  </div>
                )}
              </div>
              <EstadoBadge estado={eq.estado_actual} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
