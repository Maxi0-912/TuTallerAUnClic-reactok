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

  async function loginWithGoogle(idToken) {
    const res = await api.post('/usuarios/auth/google/', { id_token: idToken })
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)

    const perfil = await api.get('/usuarios/perfil/')
    setUser(perfil.data)
    addToast(`Bienvenido, ${perfil.data.first_name || perfil.data.username}`, 'success')
    return perfil.data
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