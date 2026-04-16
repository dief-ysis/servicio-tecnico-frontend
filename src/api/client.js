import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Necesario para enviar/recibir cookies httpOnly en requests cross-origin
  withCredentials: true,
})

client.interceptors.request.use((config) => {
  // Compatibilidad: si aún hay token en localStorage lo incluye como header
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client