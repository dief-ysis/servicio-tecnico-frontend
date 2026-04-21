import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
export const consultarEquipo = (numero) => axios.get(`${BASE}/public/equipos/${numero}`)
