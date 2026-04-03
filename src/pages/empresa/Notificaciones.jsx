import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function Notificaciones() {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro]   = useState('todas')

  useEffect(() => { fetchNotifs() }, [])

  async function fetchNotifs() {
    try {
      const res = await api.get('/notificaciones/')
      setNotifs(Array.isArray(res.data) ? res.data : res.data.results ?? [])
    } catch {}
    setLoading(false)
  }

  async function marcarLeida(id) {
    try {
      await api.patch(`/notificaciones/${id}/leida/`, {})
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
    } catch {}
  }

  async function marcarTodasLeidas() {
    const noLeidas = notifs.filter(n => !n.leida)
    await Promise.all(noLeidas.map(n => api.patch(`/notificaciones/${n.id}/leida/`, {})))
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
  }

  const filtradas = filtro === 'todas' ? notifs
    : filtro === 'leidas' ? notifs.filter(n => n.leida)
    : notifs.filter(n => !n.leida)

  const noLeidas = notifs.filter(n => !n.leida).length

  function tiempoRelativo(fechaStr) {
    const diff = Date.now() - new Date(fechaStr).getTime()
    const min  = Math.floor(diff / 60000)
    const hrs  = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)
    if (min < 1)  return 'Ahora mismo'
    if (min < 60) return `Hace ${min} min`
    if (hrs < 24) return `Hace ${hrs} h`
    return `Hace ${dias} dia${dias !== 1 ? 's' : ''}`
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Notificaciones</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al dia'}
          </p>
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodasLeidas}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Marcar todas como leidas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[
          { key: 'todas',    label: 'Todas',     count: notifs.length },
          { key: 'noleidas', label: 'Sin leer',  count: noLeidas },
          { key: 'leidas',   label: 'Leidas',    count: notifs.length - noLeidas },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filtro === f.key
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
            }`}>
            {f.label}
            <span className="ml-1.5 opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-gray-400 text-sm">Sin notificaciones</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map(n => (
            <div key={n.id}
              onClick={() => !n.leida && marcarLeida(n.id)}
              className={`rounded-2xl border p-4 flex gap-4 transition-all cursor-pointer ${
                n.leida
                  ? 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800'
                  : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-950/60'
              }`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                n.leida ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-600'
              }`}>
                <svg className={`w-4 h-4 ${n.leida ? 'text-gray-400' : 'text-white'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${
                    n.leida ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'
                  }`}>{n.titulo}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{tiempoRelativo(n.fecha)}</span>
                    {!n.leida && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${
                  n.leida ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                }`}>{n.mensaje}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}