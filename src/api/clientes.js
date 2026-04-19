import client from './client'

export const getClientes = (params) => client.get('/clientes', { params })
export const getCliente = (id) => client.get(`/clientes/${id}`)
export const crearCliente = (data) => client.post('/clientes', data)
export const actualizarCliente = (id, data) => client.patch(`/clientes/${id}`, data)

// Crea o actualiza un cliente local vinculado a BSale (upsert por bsale_id)
export const upsertClienteBsale = (data) => client.post('/clientes/bsale', data)

// Obtener clientes de BSale con paginación (para la página de clientes)
export const getClientesBsale = (params) => client.get('/bsale/clientes/lista', { params })

// Obtener equipos locales de un cliente BSale por su ID de BSale
export const getEquiposPorBsaleId = (bsaleId) => client.get(`/bsale/clientes/${bsaleId}/equipos`)
