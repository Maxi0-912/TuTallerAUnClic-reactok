import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

// Haversine — distancia en km entre dos coordenadas
function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function estaAbierto(hora_apertura, hora_cierre) {
  if (!hora_apertura || !hora_cierre) return null
  const ahora = new Date()
  const [ah, am] = hora_apertura.split(':').map(Number)
  const [ch, cm] = hora_cierre.split(':').map(Number)
  const now  = ahora.getHours() * 60 + ahora.getMinutes()
  const open = ah * 60 + am
  const close = ch * 60 + cm
  return now >= open && now <= close
}

function Estrellas({ valor }) {
  if (!valor) return <span className="text-xs text-gray-400">Sin calificaciones</span>
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(valor) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-0.5">{valor}</span>
    </div>
  )
}

function CardEstablecimiento({ e, distancia }) {
  const abierto = estaAbierto(e.hora_apertura, e.hora_cierre)

  return (
    <Link to={`/establecimientos/${e.id}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 hover:-translate-y-1 flex flex-col">

      {/* Imagen */}
      <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {e.foto_url ? (
          <img src={e.foto_url} alt={e.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}

        {/* Badge tipo */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/90 backdrop-blur-sm text-white">
            {e.tipo_nombre}
          </span>
        </div>

        {/* Badge abierto */}
        {abierto !== null && (
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
              abierto
                ? 'bg-green-500/90 text-white'
                : 'bg-gray-800/80 text-gray-300'
            }`}>
              {abierto ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {e.nombre}
        </h3>

        <Estrellas valor={e.promedio_calificacion} />

        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="line-clamp-1">{e.direccion}</span>
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {e.hora_apertura?.slice(0,5)} – {e.hora_cierre?.slice(0,5)}
        </p>

        {distancia !== null && (
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z" />
            </svg>
            {distancia < 1 ? `${Math.round(distancia * 1000)} m` : `${distancia.toFixed(1)} km`}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function Establecimientos() {
  const [searchParams]                    = useSearchParams()
  const [todos, setTodos]                 = useState([])
  const [tipos, setTipos]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [busqueda, setBusqueda]           = useState('')
  const [tipoFiltro, setTipoFiltro]       = useState(searchParams.get('tipo') ?? 'todos')
  const [orden, setOrden]                 = useState('recientes')
  const [ubicacion, setUbicacion]         = useState(null)
  const [loadingUbicacion, setLoadingUbicacion] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/establecimientos/'),
      api.get('/tipos-establecimiento/'),
    ]).then(([e, t]) => {
      setTodos(Array.isArray(e.data) ? e.data : e.data.results ?? [])
      setTipos(Array.isArray(t.data) ? t.data : t.data.results ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function pedirUbicacion() {
    if (!navigator.geolocation) return
    setLoadingUbicacion(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setOrden('cercanos')
        setLoadingUbicacion(false)
      },
      () => setLoadingUbicacion(false)
    )
  }

  const filtrados = todos
    .filter(e => {
      if (busqueda && !e.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      if (tipoFiltro !== 'todos' && e.tipo_nombre?.toLowerCase() !== tipoFiltro.toLowerCase()) return false
      return true
    })
    .map(e => ({
      ...e,
      distancia: ubicacion && e.latitud && e.longitud
        ? distanciaKm(ubicacion.lat, ubicacion.lng, parseFloat(e.latitud), parseFloat(e.longitud))
        : null
    }))
    .sort((a, b) => {
      if (orden === 'calificacion') return (b.promedio_calificacion ?? 0) - (a.promedio_calificacion ?? 0)
      if (orden === 'cercanos' && a.distancia !== null) return a.distancia - b.distancia
      return b.id - a.id // recientes
    })

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100">Talleres y lavaderos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {loading ? 'Cargando...' : `${filtrados.length} establecimientos encontrados`}
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800/20 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-8 flex flex-col sm:flex-row gap-3 flex-wrap">

          {/* Busqueda */}
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo */}
          <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="todos">Todos los tipos</option>
            {tipos.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
          </select>

          {/* Orden */}
          <select value={orden} onChange={e => setOrden(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="recientes">Más recientes</option>
            <option value="calificacion">Mejor calificados</option>
            <option value="cercanos" disabled={!ubicacion}>
              {ubicacion ? 'Más cercanos' : 'Más cercanos (activa ubicacion)'}
            </option>
          </select>

          {/* Ubicacion */}
          <button onClick={pedirUbicacion} disabled={loadingUbicacion || !!ubicacion}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors font-medium ${
              ubicacion
                ? 'border-green-400 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
            {loadingUbicacion ? (
              <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            )}
            {ubicacion ? 'Ubicacion activa' : 'Usar mi ubicacion'}
          </button>
        </div>

        {/* Grid de cards */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron establecimientos</p>
            <button onClick={() => { setBusqueda(''); setTipoFiltro('todos') }}
              className="text-blue-600 text-sm hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtrados.map(e => (
              <CardEstablecimiento key={e.id} e={e} distancia={e.distancia} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}