import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEquipo, cambiarEstado, getHistorial, actualizarEquipo, subirFoto } from '../api/equipos'
import EstadoBadge from '../components/EstadoBadge'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { useIsMobile } from '../hooks/useIsMobile'
import { generarDocumentoBsale, getBsaleConfig } from '../api/equipos'

const inputStyle = {
  width: '100%', border: '1px solid var(--input-border)', borderRadius: 4,
  padding: '9px 11px', fontSize: 13, outline: 'none',
  background: 'var(--input-bg)', color: 'var(--text-1)', resize: 'vertical'
}

const estadoConfig = {
  por_reparar:    { label: 'Por reparar',     bg: 'var(--warning-bg)',   color: 'var(--warning-text)',  border: '#e6d060' },
  en_reparacion:  { label: 'En reparación',   bg: 'var(--info-bg)',      color: 'var(--info-text)',     border: '#a0c0e8' },
  espera_repuesto:{ label: 'Espera repuesto', bg: '#f5eafd',             color: '#6b2fa0',              border: '#c9a0e8' },
  reparado:       { label: 'Reparado',        bg: 'var(--success-bg)',   color: 'var(--success-text)',  border: '#a8cc80' },
  irreparable:    { label: 'Irreparable',     bg: 'var(--danger-bg)',    color: 'var(--danger-text)',   border: '#e8a0a0' },
  entregado:      { label: 'Entregado',       bg: 'var(--border-color)', color: 'var(--text-2)',        border: 'var(--border-color)' },
}

const ESTADOS = ['por_reparar', 'en_reparacion', 'espera_repuesto', 'reparado', 'irreparable', 'entregado']

export default function EquipoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const toast = useToast()
  const { isMobile } = useIsMobile()
  const [equipo, setEquipo] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [estadoPendiente, setEstadoPendiente] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [generandoDoc, setGenerandoDoc] = useState(false)
  const [docGenerado, setDocGenerado] = useState(null)
  const [bsaleConfig, setBsaleConfig] = useState(null)
  const [docTypeId, setDocTypeId] = useState('')
  const [officeId, setOfficeId] = useState('')
  const [priceListId, setPriceListId] = useState('')

  const cargar = useCallback(() => {
    setLoading(true)
    Promise.all([getEquipo(id), getHistorial(id)])
      .then(([eq, hist]) => {
        setEquipo(eq.data)
        setForm({
          diagnostico: eq.data.diagnostico ?? '',
          observaciones: eq.data.observaciones ?? '',
          accesorios: eq.data.accesorios ?? '',
          notas_tecnico: eq.data.notas_tecnico ?? '',
          costo_reparacion: eq.data.costo_reparacion ?? '',
          garantia_dias:    eq.data.garantia_dias ?? '',
        })
        setHistorial(hist.data)
      })
      .catch(() => toast('Error al cargar el equipo', 'error'))
      .finally(() => setLoading(false))
  }, [id, toast])

  useEffect(() => { cargar() }, [cargar])

  // Cargar tipos de documento y oficinas de BSale (solo técnico)
  useEffect(() => {
    if (usuario?.rol !== 'tecnico') return
    getBsaleConfig()
      .then(r => {
        setBsaleConfig(r.data)
        // Pre-seleccionar el primero disponible
        if (r.data.tipos?.length)   setDocTypeId(String(r.data.tipos[0].id))
        if (r.data.oficinas?.length) setOfficeId(String(r.data.oficinas[0].id))
        if (r.data.listas?.length)  setPriceListId(String(r.data.listas[0].id))
      })
      .catch(() => {}) // no bloquear si BSale no responde
  }, [usuario])

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
      await subirFoto(id, file)
      toast('Foto subida correctamente')
      cargar()
    } catch {
      toast('Error al subir la foto', 'error')
    } finally {
      setSubiendo(false)
    }
  }

  const handleGenerarDocumento = async () => {
    if (!equipo.costo_reparacion || equipo.costo_reparacion <= 0) {
      toast('Debes ingresar el costo de reparación primero', 'error')
      return
    }
    setGenerandoDoc(true)
    try {
      const res = await generarDocumentoBsale({
        equipoId: id,
        clienteBsaleId: equipo.cliente_bsale_id,
        monto: equipo.costo_reparacion,
        descripcion: `Reparación ${equipo.tipo_equipo} ${equipo.marca} ${equipo.modelo} - ${equipo.falla_reportada}`,
        documentTypeId: docTypeId    ? parseInt(docTypeId)    : undefined,
        officeId:       officeId     ? parseInt(officeId)     : undefined,
        priceListId:    priceListId  ? parseInt(priceListId)  : undefined,
      })
      setDocGenerado(res.data)
      toast('Documento generado en Bsale')
      cargar()
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Error al generar documento'
      const det = err.response?.data?.detalle?.error
      toast(det ? `${msg}: ${det}` : msg, 'error')
    } finally {
      setGenerandoDoc(false)
    }
  }

  const formatFecha = (iso) => iso ? new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 20 }}>Cargando...</div>
  if (!equipo) return <div style={{ color: 'var(--text-3)', padding: 20 }}>Equipo no encontrado</div>

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate('/equipos')} style={{
          background: 'none', border: 'none', color: 'var(--link)',
          fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 600,
          marginBottom: 10, display: 'block'
        }}>← Volver a equipos</button>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: 12
        }}>
          <div>
            <div style={{
              fontFamily: 'monospace', fontSize: 12,
              color: 'var(--link)', marginBottom: 4, fontWeight: 700
            }}>
              {equipo.numero_ingreso}
            </div>
            <h1 style={{
              fontSize: isMobile ? 18 : 22, fontWeight: 900,
              color: 'var(--text-1)', textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              {equipo.marca} {equipo.modelo || equipo.tipo_equipo}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <EstadoBadge estado={equipo.estado_actual} />
            <button onClick={() => navigate(`/equipos/${id}/orden`)} style={{
              background: '#000', color: '#ffcd0d', border: 'none',
              borderRadius: 4, padding: '7px 14px', fontSize: 10,
              fontWeight: 900, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer'
            }}>
              Imprimir orden
            </button>
          </div>
        </div>
      </div>

      {/* Grid info */}
      <div className="detalle-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, marginBottom: 12
      }}>
        {/* Cliente */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '18px 20px'
        }}>
          <div style={{
            fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-3)',
            marginBottom: 14, paddingBottom: 8,
            borderBottom: '1px solid var(--border-color)'
          }}>Datos del cliente</div>
          <DataRow label="Nombre" value={equipo.cliente_nombre} />
          <DataRow label="Teléfono" value={equipo.cliente_telefono} />
        </div>

        {/* Equipo */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '18px 20px'
        }}>
          <div style={{
            fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-3)',
            marginBottom: 14, paddingBottom: 8,
            borderBottom: '1px solid var(--border-color)'
          }}>Datos del equipo</div>
          <DataRow label="Tipo" value={equipo.tipo_equipo} />
          <DataRow label="Marca" value={equipo.marca} />
          <DataRow label="Modelo" value={equipo.modelo} />
          <DataRow label="N° serie" value={equipo.password_pin} />
          <DataRow label="Accesorios" value={equipo.accesorios} />
          <DataRow label="Ingreso" value={formatFecha(equipo.fecha_ingreso)} />
          {equipo.fecha_entrega && (
            <DataRow label="Entregado" value={formatFecha(equipo.fecha_entrega)} highlight />
          )}
        </div>
      </div>

      {/* Diagnóstico */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderLeft: '4px solid #ffcd0d',
        borderRadius: 8, padding: '18px 20px', marginBottom: 12
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16
        }}>
          <div style={{
            fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-3)'
          }}>Diagnóstico y notas</div>
          {usuario.rol === 'tecnico' && !['reparado', 'entregado'].includes(equipo.estado_actual) && (
            <button onClick={() => editando ? handleGuardar() : setEditando(true)} style={{
              background: editando ? '#ffcd0d' : 'none',
              border: '1px solid var(--border-color)', borderRadius: 4,
              padding: '6px 14px', fontSize: 10, fontWeight: 800,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', color: editando ? '#000' : 'var(--text-2)'
            }}>
              {guardando ? 'Guardando...' : editando ? 'Guardar' : 'Editar'}
            </button>
          )}
          {usuario.rol === 'tecnico' && ['reparado', 'entregado'].includes(equipo.estado_actual) && (
            <span style={{
              fontSize: 10, color: 'var(--text-3)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              🔒 Solo lectura
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div>
            <FieldLabel>Falla reportada</FieldLabel>
            <FieldValue>{equipo.falla_reportada}</FieldValue>
          </div>
          <div>
            <FieldLabel>Diagnóstico técnico</FieldLabel>
            {editando ? (
              <textarea value={form.diagnostico}
                onChange={e => setForm(p => ({ ...p, diagnostico: e.target.value }))}
                rows={3} style={inputStyle} />
            ) : (
              <FieldValue>{equipo.diagnostico}</FieldValue>
            )}
          </div>
          <div>
            <FieldLabel>Notas internas del técnico</FieldLabel>
            {editando ? (
              <textarea value={form.notas_tecnico}
                onChange={e => setForm(p => ({ ...p, notas_tecnico: e.target.value }))}
                rows={2} placeholder="falta repuesto, cliente llamó..."
                style={inputStyle} />
            ) : (
              equipo.notas_tecnico ? (
                <div style={{
                  background: 'var(--warning-bg)', border: '1px solid #e6d060',
                  borderRadius: 4, padding: '8px 10px',
                  fontSize: 12, color: 'var(--warning-text)', marginTop: 4
                }}>
                  {equipo.notas_tecnico}
                </div>
              ) : <FieldValue>{equipo.notas_tecnico}</FieldValue>
            )}
          </div>
          <div>
            <FieldLabel>Observaciones internas</FieldLabel>
            {editando ? (
              <textarea value={form.observaciones}
                onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
                rows={2} style={inputStyle} />
            ) : (
              <FieldValue>{equipo.observaciones}</FieldValue>
            )}
          </div>
        </div>

        {/* Costo + Garantía */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)',
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div>
            <FieldLabel>Costo de reparación</FieldLabel>
            {editando ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 700 }}>$</span>
                <input type="number" min="0" step="1"
                  value={form.costo_reparacion}
                  onChange={e => setForm(p => ({ ...p, costo_reparacion: e.target.value }))}
                  style={{ ...inputStyle, maxWidth: 160, resize: 'none' }}
                  placeholder="0" />
              </div>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)', marginTop: 4 }}>
                {equipo.costo_reparacion
                  ? `$${Number(equipo.costo_reparacion).toLocaleString('es-CL')}`
                  : <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 400 }}>—</span>}
              </div>
            )}
          </div>
          <div>
            <FieldLabel>Garantía (días)</FieldLabel>
            {editando ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input type="number" min="0" max="3650" step="1"
                  value={form.garantia_dias ?? ''}
                  onChange={e => setForm(p => ({ ...p, garantia_dias: e.target.value }))}
                  style={{ ...inputStyle, maxWidth: 100, resize: 'none' }}
                  placeholder="90" />
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>días</span>
              </div>
            ) : equipo.garantia_dias ? (
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--success-text)' }}>
                  {equipo.garantia_dias} días
                </span>
                {equipo.garantia_hasta && (
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    Vence: {new Date(equipo.garantia_hasta).toLocaleDateString('es-CL')}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>—</div>
            )}
          </div>
        </div>
      </div>

      {/* Foto — visible para todos, upload solo técnico */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '18px 20px', marginBottom: 12
      }}>
        <div style={{
          fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: 14
        }}>Foto del equipo</div>
        {equipo.foto_url ? (
          <div>
            <img src={equipo.foto_url} alt="Foto del equipo"
              style={{
                width: '100%', maxWidth: 400, borderRadius: 6,
                border: '1px solid var(--border-color)', cursor: 'pointer',
                display: 'block'
              }}
              onClick={() => window.open(equipo.foto_url, '_blank')}
            />
            {/* URL de Cloudinary solo para técnico */}
            {usuario.rol === 'tecnico' && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)',
                wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {equipo.foto_url}
              </div>
            )}
          </div>
        ) : usuario.rol === 'tecnico' ? (
          <label style={{ cursor: 'pointer', display: 'block' }}>
            <div style={{
              border: '2px dashed var(--border-color)', borderRadius: 6,
              padding: '24px', textAlign: 'center',
              color: 'var(--text-3)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.04em'
            }}>
              {subiendo ? 'Subiendo...' : '+ Agregar foto del equipo'}
            </div>
            <input type="file" accept="image/*" capture="environment"
              onChange={handleFoto} style={{ display: 'none' }}
              disabled={subiendo} />
          </label>
        ) : (
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Sin foto</div>
        )}
      </div>

        {usuario.rol === 'tecnico' &&
    equipo.costo_reparacion > 0 &&
    ['reparado', 'entregado'].includes(equipo.estado_actual) &&
    !equipo.bsale_documento_id && (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 8, padding: '18px 20px', marginBottom: 12
    }}>
      <div style={{
        fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: 14
      }}>Facturación Bsale</div>

      {docGenerado ? (
        <div style={{
          background: 'var(--success-bg)', border: '1px solid #a8cc80',
          borderRadius: 6, padding: '12px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--success-text)' }}>
              Documento N°{docGenerado.numero} generado
            </div>
            <div style={{ fontSize: 11, color: 'var(--success-text)', marginTop: 2 }}>
              ${Number(docGenerado.total).toLocaleString('es-CL')}
            </div>
          </div>
          {docGenerado.urlPdf && (
            <a href={docGenerado.urlPdf} target="_blank" rel="noreferrer" style={{
              background: '#000', color: '#ffcd0d', borderRadius: 4,
              padding: '6px 14px', fontSize: 10, fontWeight: 900,
              letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              Ver PDF
            </a>
          )}
        </div>
      ) : !equipo.cliente_bsale_id ? (
          <div style={{
            background: 'var(--warning-bg)', border: '1px solid #e6d060',
            borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'var(--warning-text)'
          }}>
            ⚠ Este cliente no está vinculado a Bsale. Para facturar, el equipo debe registrarse con un cliente de Bsale.
          </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Selectores de tipo documento y oficina */}
          {bsaleConfig && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Tipo de documento
                </div>
                <select value={docTypeId} onChange={e => setDocTypeId(e.target.value)} style={{
                  width: '100%', border: '1px solid var(--input-border)', borderRadius: 4,
                  padding: '7px 9px', fontSize: 12, background: 'var(--input-bg)',
                  color: 'var(--text-1)', outline: 'none'
                }}>
                  {bsaleConfig.tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Oficina / Sucursal
                </div>
                <select value={officeId} onChange={e => setOfficeId(e.target.value)} style={{
                  width: '100%', border: '1px solid var(--input-border)', borderRadius: 4,
                  padding: '7px 9px', fontSize: 12, background: 'var(--input-bg)',
                  color: 'var(--text-1)', outline: 'none'
                }}>
                  {bsaleConfig.oficinas.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              {bsaleConfig.listas?.length > 1 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Lista de precios
                  </div>
                  <select value={priceListId} onChange={e => setPriceListId(e.target.value)} style={{
                    width: '100%', border: '1px solid var(--input-border)', borderRadius: 4,
                    padding: '7px 9px', fontSize: 12, background: 'var(--input-bg)',
                    color: 'var(--text-1)', outline: 'none'
                  }}>
                    {bsaleConfig.listas.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Generar documento por{' '}
              <strong style={{ color: 'var(--text-1)' }}>
                ${Number(equipo.costo_reparacion).toLocaleString('es-CL')}
              </strong>
            </div>
            <button onClick={handleGenerarDocumento} disabled={generandoDoc || (!docTypeId && bsaleConfig)} style={{
              background: '#000', color: '#ffcd0d', border: 'none',
              borderRadius: 4, padding: '8px 16px', fontSize: 10,
              fontWeight: 900, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer',
              opacity: generandoDoc || (!docTypeId && bsaleConfig) ? 0.6 : 1
            }}>
              {generandoDoc ? 'Generando...' : 'Generar en Bsale'}
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Cambiar estado */}
      {usuario.rol === 'tecnico' && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '18px 20px', marginBottom: 12
        }}>
          <div style={{
            fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: 14
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
                    borderRadius: 4, padding: '8px 14px',
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

      {/* Historial */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, overflow: 'hidden'
      }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border-color)',
          fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'var(--text-3)'
        }}>Historial de cambios</div>
        {historial.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            Sin historial
          </div>
        ) : historial
          .filter(h => h.valor_nuevo !== null && h.valor_nuevo !== '')
          .map(h => (
          <div key={h.id} style={{
            padding: '11px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: 16
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: 9, fontWeight: 900, color: '#ffcd0d',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginRight: 8
              }}>
                {h.campo_modificado.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {h.valor_anterior ?? 'vacío'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 6px' }}>→</span>
              <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 700 }}>
                {h.valor_nuevo ?? '—'}
              </span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>
                {h.usuario_nombre}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                {formatFecha(h.fecha_cambio)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal confirmación estados críticos */}
      {estadoPendiente && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: 20
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 8,
            padding: '28px 28px 24px', width: '100%', maxWidth: 380,
            border: '1px solid var(--border-color)', color: 'var(--text-1)'
          }}>
            <div style={{
              fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 12,
              color: estadoPendiente === 'irreparable'
                ? 'var(--danger-text)' : 'var(--success-text)'
            }}>
              {estadoPendiente === 'irreparable'
                ? '⚠ Confirmar irreparable'
                : '✓ Confirmar entrega'}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
              {estadoPendiente === 'irreparable'
                ? `¿Confirmas que el equipo ${equipo.numero_ingreso} no tiene reparación posible?`
                : `¿Confirmas que el equipo ${equipo.numero_ingreso} fue entregado a ${equipo.cliente_nombre}?`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEstadoPendiente(null)} style={{
                background: 'none', border: '1px solid var(--border-color)',
                borderRadius: 4, padding: '9px 16px', fontSize: 11,
                fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer',
                color: 'var(--text-1)'
              }}>Cancelar</button>
              <button onClick={() => aplicarEstado(estadoPendiente)} style={{
                background: estadoPendiente === 'irreparable' ? '#8a0000' : '#000',
                color: estadoPendiente === 'irreparable' ? '#fff' : '#ffcd0d',
                border: 'none', borderRadius: 4, padding: '9px 18px',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer'
              }}>
                {estadoPendiente === 'irreparable' ? 'Confirmar' : 'Confirmar entrega'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DataRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'baseline' }}>
      <span style={{
        fontSize: 9, fontWeight: 900, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        minWidth: 70, flexShrink: 0
      }}>{label}</span>
      <span style={{
        fontSize: 13, color: highlight ? 'var(--success-text)' : 'var(--text-1)',
        fontWeight: highlight ? 700 : 400
      }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 900, color: 'var(--text-3)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: 6
    }}>{children}</div>
  )
}

function FieldValue({ children }) {
  return (
    <div style={{
      fontSize: 13, color: children ? 'var(--text-1)' : 'var(--text-3)',
      lineHeight: 1.5, paddingBottom: 4
    }}>
      {children || '—'}
    </div>
  )
}