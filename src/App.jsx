import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Equipos from './pages/Equipos'
import Clientes from './pages/Clientes'
import EquipoDetalle from './pages/EquipoDetalle'
import Layout from './components/Layout'
import Usuarios from './pages/Usuarios'
import { ToastProvider } from './components/Toast'
import OrdenTrabajo from './pages/OrdenTrabajo'
import NotFound from './pages/NotFound'
import Privacidad from './pages/Privacidad'
import Estadisticas from './pages/Estadisticas'
import Seguimiento from './pages/Seguimiento'

function PrivateRoute({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/seguimiento" element={<Seguimiento />} />
      <Route path="/" element={
        <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
      }/>
      <Route path="/equipos" element={
        <PrivateRoute><Layout><Equipos /></Layout></PrivateRoute>
      }/>
      <Route path="/equipos/:id/orden" element={
        <PrivateRoute><OrdenTrabajo /></PrivateRoute>
      }/>
      <Route path="/equipos/:id" element={
        <PrivateRoute><Layout><EquipoDetalle /></Layout></PrivateRoute>
      }/>
      <Route path="/clientes" element={
        <PrivateRoute><Layout><Clientes /></Layout></PrivateRoute>
      }/>
      <Route path="/usuarios" element={
        <PrivateRoute><Layout><Usuarios /></Layout></PrivateRoute>
      }/>
      <Route path="/estadisticas" element={
        <PrivateRoute><Layout><Estadisticas /></Layout></PrivateRoute>
      }/>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}