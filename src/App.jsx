import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminRoutes   from './routes/AdminRoutes'
import ClienteRoutes from './routes/ClienteRoutes'
import Login         from './pages/Login'
import Register      from './pages/Register'
import EmpresaRoutes from './routes/EmpresaRoutes.jsx'
import ErrorBoundary  from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/admin/*"   element={<AdminRoutes />} />
          <Route path="/*"         element={<ClienteRoutes />} />
          <Route path="/empresa/*" element={<EmpresaRoutes />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}