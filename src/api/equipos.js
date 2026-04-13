import client from './client'

export const getEquipos = (params) => client.get('/equipos', { params })
export const getEquipo = (id) => client.get(`/equipos/${id}`)
export const crearEquipo = (data) => client.post('/equipos', data)
export const actualizarEquipo = (id, data) => client.patch(`/equipos/${id}`, data)
export const cambiarEstado = (id, estado) => client.patch(`/equipos/${id}/estado`, { estado })
export const getHistorial = (id) => client.get(`/equipos/${id}/historial`)
export const getEstadisticas = (periodo) => client.get('/equipos/estadisticas', { params: { periodo } })
export const getSinMovimiento = (dias = 7) => client.get('/equipos/sin-movimiento', { params: { dias } })
export const subirFoto = (id, file) => {
  const formData = new FormData()
  formData.append('foto', file)
  return client.post(`/equipos/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}