import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ToastContext = createContext()

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  // Permite disparar toasts desde fuera del arbol de React (ej. interceptores de axios)
  useEffect(() => {
    function handleAppToast(e) {
      const { message, type, duration } = e.detail ?? {}
      if (message) addToast(message, type, duration)
    }
    window.addEventListener('app:toast', handleAppToast)
    return () => window.removeEventListener('app:toast', handleAppToast)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
