import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import client from '../api/client'
import { useToast } from '../components/Toast'

const inputStyle = {
  width: '100%', border: '0.5px solid #ddd', borderRadius: 6,
  padding: '9px 11px', fontSize: 13, outline: 'none', background: '#fff'
}
const labelStyle = { fontSize: 12, color: '#666', display: 'block', marginBottom: 5 }

export default function Usuarios() {
  const toast = useToast()
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
      <div style={{ color: '#888', fontSize: 14, marginTop: 40, textAlign: 'center' }}>
        No tienes permisos para ver esta sección.
      </div>
    )
  }

  const rolBadge = (rol) => (
    <span style={{
      background: rol === 'tecnico' ? '#fff8d6' : '#e6f0fb',
      color: rol === 'tecnico' ? '#8a6500' : '#1a4f8a',
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
    }}>
      {rol}
    </span>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Usuarios</h1>
        <button onClick={() => { setUsuarioEditando(null); setShowModal(true) }} style={{
          background: '#ffcd0d', border: 'none', borderRadius: 6,
          padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
        }}>
          + Nuevo usuario
        </button>
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Nombre', 'Email', 'Rol', 'Estado', ''].map(h => (
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
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#888' }}>Cargando...</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, borderBottom: '0.5px solid #f5f5f5' }}>
                  {u.nombre} {u.id === usuario.id && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>(tú)</span>}
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: '#334862', borderBottom: '0.5px solid #f5f5f5' }}>
                  {u.email}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid #f5f5f5' }}>
                  {rolBadge(u.rol)}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid #f5f5f5' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: u.activo ? '#3b6011' : '#8a0000'
                  }}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '0.5px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setUsuarioEditando(u); setShowModal(true) }} style={{
                      background: 'none', border: '0.5px solid #ddd', borderRadius: 5,
                      padding: '4px 10px', fontSize: 11, color: '#334862', cursor: 'pointer'
                    }}>Editar</button>
                    {u.id === usuario.id && (
                      <button onClick={() => setShowPasswordModal(true)} style={{
                        background: 'none', border: '0.5px solid #ddd', borderRadius: 5,
                        padding: '4px 10px', fontSize: 11, color: '#334862', cursor: 'pointer'
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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, padding: '28px 28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>
            {usuario ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>×</button>
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

        {error && <div style={{ color: '#8a0000', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={{
            background: 'none', border: '0.5px solid #ddd', borderRadius: 6,
            padding: '9px 16px', fontSize: 13, cursor: 'pointer'
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: '#ffcd0d', border: 'none', borderRadius: 6,
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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 380, padding: '28px 28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Cambiar contraseña</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        {exito ? (
          <div style={{ background: '#eaf3de', color: '#3b6011', padding: '12px 14px', borderRadius: 8, fontSize: 13, textAlign: 'center' }}>
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

            {error && <div style={{ color: '#8a0000', fontSize: 12, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onClose} style={{
                background: 'none', border: '0.5px solid #ddd', borderRadius: 6,
                padding: '9px 16px', fontSize: 13, cursor: 'pointer'
              }}>Cancelar</button>
              <button onClick={handleSubmit} disabled={loading} style={{
                background: '#ffcd0d', border: 'none', borderRadius: 6,
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