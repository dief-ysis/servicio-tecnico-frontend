import client from './client'

export const getClientes = (params) => client.get('/clientes', { params })
export const getCliente = (id) => client.get(`/clientes/${id}`)
export const crearCliente = (data) => client.post('/clientes', data)
export const actualizarCliente = (id, data) => client.patch(`/clientes/${id}`, data)