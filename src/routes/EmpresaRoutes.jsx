import { Routes, Route, Navigate } from 'react-router-dom'
import EmpresaLayout        from '../layouts/EmpresaLayout'
import ProtectedRoute       from './ProtectedRoute'
import Dashboard            from '../pages/empresa/Dashboard'
import MisEstablecimientos  from '../pages/empresa/MisEstablecimientos'
import Citas                from '../pages/empresa/Citas'
import Servicios            from '../pages/empresa/Servicios'
import Calificaciones       from '../pages/empresa/Calificaciones'
import Notificaciones       from '../pages/empresa/Notificaciones'
import Perfil               from '../pages/empresa/Perfil'

export default function EmpresaRoutes() {
  return (
    <Routes>
      <Route path="/"
        element={
          <ProtectedRoute requiredRol="empresa">
            <EmpresaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"          element={<Dashboard />} />
        <Route path="establecimientos"   element={<MisEstablecimientos />} />
        <Route path="citas"              element={<Citas />} />
        <Route path="servicios"          element={<Servicios />} />
        <Route path="calificaciones"     element={<Calificaciones />} />
        <Route path="notificaciones"     element={<Notificaciones />} />
        <Route path="perfil"             element={<Perfil />} />
      </Route>
    </Routes>
  )
}