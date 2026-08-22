import axios from 'axios'

function expireSession() {
  localStorage.clear()
  if (window.location.pathname !== '/login') {
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: 'Tu sesion expiro, inicia sesion de nuevo', type: 'warning' },
    }))
    window.location.href = '/login'
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')

      if (refresh) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/usuarios/login/refresh/`, {
            refresh,
          })
          localStorage.setItem('access_token', res.data.access)
          original.headers.Authorization = `Bearer ${res.data.access}`
          return api(original)
        } catch {
          expireSession()
        }
      } else {
        expireSession()
      }
    } else if (!error.response) {
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'No se pudo conectar con el servidor', type: 'error' },
      }))
    }

    return Promise.reject(error)
  }
)

export default api