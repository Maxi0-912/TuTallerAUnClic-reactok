import { useState, useEffect } from 'react'
import api from '../../services/api'

function Estrellas({ valor }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(valor ?? 0) ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState([])
  const [establecimientos, setEstabs]       = useState([])
  const [loading, setLoading]               = useState(true)
  const [filtroEstab, setFiltroEstab]       = useState('todos')
  const [filtroPunt, setFiltroPunt]         = useState('todos')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      const estabsRes = await api.get('/empresa/mis-establecimientos/')
      const estabs = Array.isArray(estabsRes.data) ? estabsRes.data : estabsRes.data.results ?? []
      setEstabs(estabs)

      const todas = await Promise.all(
        estabs.map(e =>
          api.get(`/establecimientos/${e.id}/resenas/`)
            .then(res => res.data.map(r => ({ ...r, establecimiento_id: e.id, establecimiento_nombre: e.nombre })))
            .catch(() => [])
        )
      )
      setCalificaciones(todas.flat())
    } catch {}
    setLoading(false)
  }

  const filtradas = calificaciones.filter(c => {
    const pasaEstab = filtroEstab === 'todos' || String(c.establecimiento_id) === filtroEstab
    const pasaPunt  = filtroPunt === 'todos'  || Math.round(c.puntuacion) === parseInt(filtroPunt)
    return pasaEstab && pasaPunt
  })

  const promedio = calificaciones.length > 0
    ? (calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / calificaciones.length).toFixed(1)
    : null

  const distribucion = [5,4,3,2,1].map(n => ({
    n,
    count: calificaciones.filter(c => Math.round(c.puntuacion) === n).length,
    pct: calificaciones.length > 0
      ? (calificaciones.filter(c => Math.round(c.puntuacion) === n).length / calificaciones.length) * 100
      : 0
  }))

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Calificaciones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Reseñas recibidas en tus establecimientos
        </p>
      </div>

      {/* Resumen general */}
      {calificaciones.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="text-center shrink-0">
              <p className="text-5xl font-black text-gray-800 dark:text-gray-100">{promedio}</p>
              <Estrellas valor={parseFloat(promedio)} />
              <p className="text-xs text-gray-400 mt-1">{calificaciones.length} reseñas</p>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 w-full">
              {distribucion.map(d => (
                <div key={d.n} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-2 shrink-0">{d.n}</span>
                  <svg className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded-full bg-yellow-400 transition-all duration-500"
                      style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-4 shrink-0">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        {establecimientos.length > 1 && (
          <select value={filtroEstab} onChange={e => setFiltroEstab(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="todos">Todos los establecimientos</option>
            {establecimientos.map(e => <option key={e.id} value={String(e.id)}>{e.nombre}</option>)}
          </select>
        )}
        <select value={filtroPunt} onChange={e => setFiltroPunt(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="todos">Todas las puntuaciones</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrella{n !== 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <span className="text-4xl">⭐</span>
          <p className="text-gray-400 text-sm">
            {calificaciones.length === 0 ? 'Aun no tienes calificaciones' : 'Sin resultados con estos filtros'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((c, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
                {c.foto_url
                  ? <img src={c.foto_url} alt={c.usuario} className="w-full h-full object-cover" />
                  : <span className="text-white text-sm font-bold">{c.usuario?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.usuario}</p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">{c.establecimiento_nombre}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Estrellas valor={c.puntuacion} />
                    <p className="text-xs text-gray-400">{c.fecha}</p>
                  </div>
                </div>
                {c.comentario && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                    "{c.comentario}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}