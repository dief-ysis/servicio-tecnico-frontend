import client from './client'

export const getEquipos = (params) => client.get('/equipos', { params })
export const getEquipo = (id) => client.get(`/equipos/${id}`)
export const crearEquipo = (data) => client.post('/equipos', data)
export const actualizarEquipo = (id, data) => client.patch(`/equipos/${id}`, data)
export const cambiarEstado = (id, estado) => client.patch(`/equipos/${id}/estado`, { estado })
export const getHistorial = (id) => client.get(`/equipos/${id}/historial`)