import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast }          = useToast()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/usuarios/perfil/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.clear()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(username, password) {
    const res = await api.post('/usuarios/login/', { username, password })
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)

    const perfil = await api.get('/usuarios/perfil/')
    setUser(perfil.data)
    addToast(`Bienvenido, ${perfil.data.first_name || perfil.data.username}`, 'success')
    return perfil.data
  }

  // rol solo se manda cuando el usuario ya eligio Cliente/Empresa en el
  // selector, tras un primer intento que devolvio requiere_rol=true.
  async function loginWithGoogle(credential, rol) {
    const res = await api.post('/usuarios/auth/google/', rol ? { credential, rol } : { credential })

    if (res.data?.requiere_rol) {
      return { requiereRol: true, ...res.data }
    }

    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    setUser(res.data.user)
    addToast(`Bienvenido, ${res.data.user.first_name || res.data.user.username}`, 'success')
    return res.data.user
  }

  function logout() {
    localStorage.clear()
    setUser(null)
    addToast('Sesion cerrada', 'info')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}