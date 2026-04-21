import client from './client'

export const getEquipos = (params) => client.get('/equipos', { params })
export const getEquipo = (id) => client.get(`/equipos/${id}`)
export const crearEquipo = (data) => client.post('/equipos', data)
export const actualizarEquipo = (id, data) => client.patch(`/equipos/${id}`, data)
export const cambiarEstado = (id, estado) => client.patch(`/equipos/${id}/estado`, { estado })
export const getHistorial = (id) => client.get(`/equipos/${id}/historial`)
export const getEstadisticas = (periodo) => client.get('/equipos/estadisticas', { params: { periodo } })
export const getSinMovimiento = (dias = 7) => client.get('/equipos/sin-movimiento', { params: { dias } })
export const buscarClientesBsale = (q) => client.get('/bsale/clientes', { params: { q } })
export const generarDocumentoBsale = (data) => client.post('/bsale/documento', data)
export const getBsaleConfig = () => client.get('/bsale/config')
export const subirFoto = (id, file, etiqueta = 'general') => {
  const formData = new FormData()
  formData.append('foto', file)
  return client.post(`/equipos/${id}/foto?etiqueta=${etiqueta}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const getFotos = (id) => client.get(`/equipos/${id}/fotos`)
export const eliminarFoto = (id, fotoId) => client.delete(`/equipos/${id}/fotos/${fotoId}`)
export const enviarPresupuesto = (id, data) => client.post(`/equipos/${id}/presupuesto`, data)
export const responderPresupuesto = (id, data) => client.patch(`/equipos/${id}/presupuesto`, data)
export const guardarFirma = (id, firma_base64) => client.post(`/equipos/${id}/firma`, { firma_base64 })