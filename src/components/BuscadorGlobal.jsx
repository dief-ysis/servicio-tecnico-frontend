import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEquipos } from '../api/equipos'
import { getClientes } from '../api/clientes'
import EstadoBadge from './EstadoBadge'

export default function BuscadorGlobal() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState({ equipos: [], clientes: [] })
  const [abierto, setAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResultados({ equipos: [], clientes: [] }); return }
    setLoading(true)
    Promise.all([
      getEquipos({ buscar: query }),
      getClientes({ buscar: query })
    ]).then(([eq, cl]) => {
      setResultados({ equipos: eq.data.slice(0, 4), clientes: cl.data.slice(0, 3) })
      setAbierto(true)
    }).finally(() => setLoading(false))
  }, [query])

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
          onChange={e => setQuery(e.target.value)}
          onFocus={() => total > 0 && setAbierto(true)}
          placeholder="Buscar equipo, cliente, N° ingreso..."
          style={{
            width: '100%', border: '1px solid #e0e0e0', borderRadius: 4,
            padding: '8px 12px 8px 28px', fontSize: 12, outline: 'none',
            background: '#fafafa', color: '#111'
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
          background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 500, overflow: 'hidden'
        }}>
          {resultados.equipos.length > 0 && (
            <>
              <div style={{
                padding: '6px 12px', fontSize: 9, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#999', background: '#fafafa', borderBottom: '1px solid #f0f0f0'
              }}>Equipos</div>
              {resultados.equipos.map(eq => (
                <div key={eq.id} onClick={() => ir(`/equipos/${eq.id}`)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#334862', marginBottom: 2 }}>
                      {eq.numero_ingreso}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
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
                color: '#999', background: '#fafafa', borderBottom: '1px solid #f0f0f0'
              }}>Clientes</div>
              {resultados.clientes.map(cl => (
                <div key={cl.id} onClick={() => ir(`/clientes`)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{cl.nombre}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{cl.telefono}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}