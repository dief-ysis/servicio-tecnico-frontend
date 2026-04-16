import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import client from '../api/client'
import { useToast } from '../components/Toast'
import { useIsMobile } from '../hooks/useIsMobile'

const inputStyle = {
  width: '100%', border: '0.5px solid var(--input-border)', borderRadius: 6,
  padding: '9px 11px', fontSize: 13, outline: 'none', background: 'var(--input-bg)'
}
const labelStyle = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 5 }

export default function Usuarios() {
  const toast = useToast()
  const { isMobile } = useIsMobile()
  const { usuario } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const cargar = () => {
    setLoading(true)
    client.get('/usuarios').then(r => setUsuarios(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  if (usuario.rol !== 'tecnico') {
    return (
      <div style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 40, textAlign: 'center' }}>
        No tienes permisos para ver esta sección.
      </div>
    )
  }

  const rolBadge = (rol) => (
    <span style={{
      background: rol === 'tecnico' ? 'var(--warning-bg)' : 'var(--info-bg)',
      color: rol === 'tecnico' ? 'var(--warning-text)' : 'var(--info-text)',
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
    }}>
      {rol}
    </span>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>Usuarios</h1>
        <button onClick={() => { setUsuarioEditando(null); setShowModal(true) }} style={{
          background: 'var(--primary)', border: 'none', borderRadius: 6,
          padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
        }}>
          + Nuevo usuario
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-table-head)' }}>
              {['Nombre', 'Email', 'Rol', 'Estado', ''].map(h => (
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
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Cargando...</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, borderBottom: '0.5px solid var(--border-color)' }}>
                  {u.nombre} {u.id === usuario.id && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>(tú)</span>}
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--link)', borderBottom: '0.5px solid var(--border-color)' }}>
                  {u.email}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                  {rolBadge(u.rol)}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: u.activo ? 'var(--success-text)' : 'var(--danger-text)'
                  }}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setUsuarioEditando(u); setShowModal(true) }} style={{
                      background: 'none', border: '0.5px solid var(--border)', borderRadius: 5,
                      padding: '4px 10px', fontSize: 11, color: 'var(--link)', cursor: 'pointer'
                    }}>Editar</button>
                    {u.id === usuario.id && (
                      <button onClick={() => setShowPasswordModal(true)} style={{
                        background: 'none', border: '0.5px solid var(--border)', borderRadius: 5,
                        padding: '4px 10px', fontSize: 11, color: 'var(--link)', cursor: 'pointer'
                      }}>Contraseña</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ModalUsuario
          usuario={usuarioEditando}
          onClose={() => setShowModal(false)}
          onGuardado={() => { setShowModal(false); cargar() }}
        />
      )}

      {showPasswordModal && (
        <ModalPassword
          usuarioId={usuario.id}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  )
}

function ModalUsuario({ usuario, onClose, onGuardado }) {
  const toast = useToast()
  const { isMobile } = useIsMobile()
  const [form, setForm] = useState({
    nombre: usuario?.nombre ?? '',
    email: usuario?.email ?? '',
    password: '',
    rol: usuario?.rol ?? 'recepcionista',
    activo: usuario?.activo ?? true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) { setError('Nombre y email son requeridos'); return }
    if (!usuario && !form.password) { setError('La contraseña es requerida'); return }
    setLoading(true)
    try {
      if (usuario) {
        await client.patch(`/usuarios/${usuario.id}`, {
          nombre: form.nombre, rol: form.rol, activo: form.activo
        })
      } else {
        await client.post('/usuarios', form)
      }

      toast(usuario ? 'Usuario actualizado' : 'Usuario creado correctamente')
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 999, padding: 20,
      overflowY: isMobile ? 'auto' : 'hidden'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: isMobile ? 0 : 12, width: '100%',
        maxWidth: isMobile ? '100%' : 420, height: isMobile ? '100%' : 'auto',
        maxHeight: isMobile ? '100%' : '90vh', padding: isMobile ? '24px 20px' : '28px 28px 24px',
        margin: isMobile ? 0 : 'auto', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>
            {usuario ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)' }}>×</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre *</label>
          <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} autoFocus />
        </div>
        {!usuario && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email *</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
          </div>
        )}
        {!usuario && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Contraseña *</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={inputStyle} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Rol</label>
          <select value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))} style={inputStyle}>
            <option value="recepcionista">Recepcionista</option>
            <option value="tecnico">Técnico</option>
          </select>
        </div>
        {usuario && (
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="activo" checked={form.activo}
              onChange={e => setForm(p => ({ ...p, activo: e.target.checked }))} />
            <label htmlFor="activo" style={{ fontSize: 13, cursor: 'pointer' }}>Usuario activo</label>
          </div>
        )}

        {error && <div style={{ color: 'var(--danger-text)', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
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

function ModalPassword({ usuarioId, onClose }) {
  const { isMobile } = useIsMobile()
  const [form, setForm] = useState({ password_actual: '', password_nuevo: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleSubmit = async () => {
    if (form.password_nuevo !== form.confirmar) { setError('Las contraseñas no coinciden'); return }
    if (form.password_nuevo.length < 8) { setError('Mínimo 8 caracteres'); return }
    setLoading(true)
    try {
      await client.patch(`/usuarios/${usuarioId}/password`, {
        password_actual: form.password_actual,
        password_nuevo: form.password_nuevo
      })
      setExito(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 999, padding: 20,
      overflowY: isMobile ? 'auto' : 'hidden'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: isMobile ? 0 : 12, width: '100%',
        maxWidth: isMobile ? '100%' : 380, height: isMobile ? '100%' : 'auto',
        maxHeight: isMobile ? '100%' : '90vh', padding: isMobile ? '24px 20px' : '28px 28px 24px',
        margin: isMobile ? 0 : 'auto', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Cambiar contraseña</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)' }}>×</button>
        </div>

        {exito ? (
          <div style={{ background: 'var(--success-bg)', color: 'var(--success-text)', padding: '12px 14px', borderRadius: 8, fontSize: 13, textAlign: 'center' }}>
            Contraseña actualizada correctamente
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Contraseña actual</label>
              <input type="password" value={form.password_actual} onChange={e => setForm(p => ({ ...p, password_actual: e.target.value }))} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input type="password" value={form.password_nuevo} onChange={e => setForm(p => ({ ...p, password_nuevo: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input type="password" value={form.confirmar} onChange={e => setForm(p => ({ ...p, confirmar: e.target.value }))} style={inputStyle} />
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
                {loading ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}