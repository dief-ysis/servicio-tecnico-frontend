import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEquipos } from '../api/equipos'
import { getClientesBsale } from '../api/clientes'
import EstadoBadge from './EstadoBadge'

export default function BuscadorGlobal() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState({ equipos: [], clientes: [] })
  const [abierto, setAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  // Cerrar al click fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const buscar = useCallback(async (q) => {
    if (q.length < 2) {
      setResultados({ equipos: [], clientes: [] })
      setAbierto(false)
      return
    }
    setLoading(true)
    try {
      const [eq, cl] = await Promise.all([
        getEquipos({ buscar: q, limite: 5 }),
        getClientesBsale({ buscar: q, limite: 5 })
      ])
      const equipos  = (eq.data.data  ?? eq.data  ?? []).slice(0, 4)
      const clientes = (cl.data.data  ?? cl.data  ?? []).slice(0, 3)
      setResultados({ equipos, clientes })
      setAbierto(equipos.length > 0 || clientes.length > 0)
    } catch {
      setResultados({ equipos: [], clientes: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => buscar(q), 300)
  }

  const ir = (path) => {
    setQuery('')
    setAbierto(false)
    navigate(path)
  }

  const total = resultados.equipos.length + resultados.clientes.length

  return (
    <div ref={ref} style={{ position: 'relative', width: 300 }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 12, color: '#999', pointerEvents: 'none'
        }}>⌕</span>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => total > 0 && setAbierto(true)}
          placeholder="Buscar equipo, cliente, N° ingreso..."
          style={{
            width: '100%', border: '1px solid var(--input-border)', borderRadius: 4,
            padding: '8px 12px 8px 28px', fontSize: 12, outline: 'none',
            background: 'var(--input-bg)', color: 'var(--text-1)'
          }}
        />
        {loading && (
          <span style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 10, color: '#999'
          }}>...</span>
        )}
      </div>

      {abierto && total > 0 && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 500, overflow: 'hidden'
        }}>
          {resultados.equipos.length > 0 && (
            <>
              <div style={{
                padding: '6px 12px', fontSize: 9, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: 'var(--text-3)', background: 'var(--bg-table-head)',
                borderBottom: '1px solid var(--border-color)'
              }}>Equipos</div>
              {resultados.equipos.map(eq => (
                <div key={eq.id} onClick={() => ir(`/equipos/${eq.id}`)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--link)', marginBottom: 2 }}>
                      {eq.numero_ingreso}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                      {eq.cliente_nombre} — {eq.marca} {eq.tipo_equipo}
                    </div>
                  </div>
                  <EstadoBadge estado={eq.estado_actual} />
                </div>
              ))}
            </>
          )}

          {resultados.clientes.length > 0 && (
            <>
              <div style={{
                padding: '6px 12px', fontSize: 9, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: 'var(--text-3)', background: 'var(--bg-table-head)',
                borderBottom: '1px solid var(--border-color)'
              }}>Clientes BSale</div>
              {resultados.clientes.map(cl => (
                <div key={cl.id} onClick={() => ir('/clientes')}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{cl.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                    {cl.code && `RUT: ${cl.code}`}
                    {cl.phone && ` · ${cl.phone}`}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
