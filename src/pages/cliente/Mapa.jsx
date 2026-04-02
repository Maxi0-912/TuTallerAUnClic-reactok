import { useState, useEffect, useRef, useCallback } from 'react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../../services/api'

function crearIcono(esTallerFlag) {
  const color = esTallerFlag ? '#2563eb' : '#0891b2'
  const emoji = esTallerFlag ? '🔧' : '💧'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:38px; height:38px;
        border-radius:50% 50% 50% 4px;
        transform:rotate(-45deg);
        background:${color};
        border:2.5px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex; align-items:center; justify-content:center;
      ">
        <span style="transform:rotate(45deg); font-size:16px; line-height:1;">${emoji}</span>
      </div>`,
    iconSize:   [38, 38],
    iconAnchor: [19, 38],
    popupAnchor:[0, -40],
  })
}

const iconoTaller   = crearIcono(true)
const iconoLavadero = crearIcono(false)
const iconoUsuario  = L.divIcon({
  className: '',
  html: `<div style="
    width:18px; height:18px; border-radius:50%;
    background:#3b82f6; border:3px solid white;
    box-shadow:0 0 0 4px rgba(59,130,246,0.35);
  "></div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
})

function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function estrellas(n) {
  const v = parseFloat(n) || 0
  return '★'.repeat(Math.round(v)) + '☆'.repeat(5 - Math.round(v))
}

function esTaller(e) {
  return e.tipo_nombre?.toLowerCase() === 'taller'
}

function useEstablecimientosVisibles(todos, setBounds) {
  const [visibles, setVisibles] = useState([])

  const MapEventos = () => {
    const map = useMapEvents({
      moveend: () => {
        const b = map.getBounds()
        setBounds(b)
        setVisibles(
          todos.filter(e => {
            if (!e.latitud || !e.longitud) return false
            return b.contains([parseFloat(e.latitud), parseFloat(e.longitud)])
          })
        )
      },
      zoomend: () => {
        const b = map.getBounds()
        setBounds(b)
        setVisibles(
          todos.filter(e => {
            if (!e.latitud || !e.longitud) return false
            return b.contains([parseFloat(e.latitud), parseFloat(e.longitud)])
          })
        )
      },
    })
    return null
  }

  return { visibles, setVisibles, MapEventos }
}

function FlyToLocation({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.5 })
  }, [coords])
  return null
}

function FlyToMarker({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([parseFloat(target.latitud), parseFloat(target.longitud)], 16, { duration: 1 })
  }, [target])
  return null
}

function TarjetaSidebar({ e, userCoords, onClick, activo }) {
  const dist = userCoords && e.latitud && e.longitud
    ? distanciaKm(userCoords[0], userCoords[1], parseFloat(e.latitud), parseFloat(e.longitud))
    : null

  return (
    <button
      onClick={() => onClick(e)}
      className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group
        ${activo
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-md'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 hover:shadow-sm'
        }`}
    >
      <div className="flex gap-3 p-3">
        {/* Foto */}
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
          {e.foto_url
            ? <img src={e.foto_url} alt={e.nombre} className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {esTaller(e) ? '🔧' : '💧'}
              </div>
            )
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight truncate">{e.nombre}</p>
            <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full
              ${esTaller(e)
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300'
              }`}>
              {esTaller(e) ? 'Taller' : 'Lavadero'}
            </span>
          </div>

          {e.calificacion_promedio > 0 && (
            <p className="text-xs text-amber-500 mt-0.5">
              {estrellas(e.calificacion_promedio)}
              <span className="text-gray-400 dark:text-gray-500 ml-1">({parseFloat(e.calificacion_promedio).toFixed(1)})</span>
            </p>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{e.direccion}</p>

          {dist !== null && (
            <p className="text-xs text-blue-500 font-medium mt-0.5">
              📍 {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

function PopupEstablecimiento({ e }) {
  return (
    <div className="w-52">
      {e.foto_url && (
        <div className="w-full h-28 overflow-hidden rounded-t-lg -mx-0 mb-2">
          <img src={e.foto_url} alt={e.nombre} className="w-full h-full object-cover" />
        </div>
      )}
      <p className="font-bold text-gray-800 text-sm leading-tight">{e.nombre}</p>
      <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-full mt-1
        ${esTaller(e) ? 'bg-blue-100 text-blue-700' : 'bg-cyan-100 text-cyan-700'}`}>
        {esTaller(e) ? '🔧 Taller' : '💧 Lavadero'}
      </span>

      {e.calificacion_promedio > 0 && (
        <p className="text-xs text-amber-500 mt-1">
          {estrellas(e.calificacion_promedio)}
          <span className="text-gray-400 ml-1">({parseFloat(e.calificacion_promedio).toFixed(1)})</span>
        </p>
      )}

      {e.direccion && (
        <p className="text-xs text-gray-500 mt-1 leading-tight">{e.direccion}</p>
      )}

      {e.horario && (
        <p className="text-xs text-gray-400 mt-1">🕐 {e.horario}</p>
      )}

      <Link
        to={`/establecimientos/${e.id}`}
        className="mt-2 flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
      >
        Ver detalle
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  )
}

export default function MapaPage() {
  const [todos, setTodos]               = useState([])
  const [filtro, setFiltro]             = useState('todos')   // 'todos' | 'taller' | 'lavadero'
  const [busqueda, setBusqueda]         = useState('')
  const [userCoords, setUserCoords]     = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError]     = useState('')
  const [activoSidebar, setActivoSidebar]     = useState(null)
  const [flyTarget, setFlyTarget]             = useState(null)
  const [flyUser, setFlyUser]                 = useState(null)
  const [bounds, setBounds]                   = useState(null)
  const [sidebarOpen, setSidebarOpen]         = useState(true)

  const handleBoundsChange = useCallback((b) => {
    setBounds(b)
  }, [])

  const CENTRO_DEFAULT = [2.4419, -76.6063]   // Popayán, Colombia

  // ── Cargar establecimientos ──
  useEffect(() => {
    api.get('/establecimientos/')
      .then(res => setTodos(Array.isArray(res.data) ? res.data : res.data.results ?? []))
      .catch(() => setTodos([]))
  }, [])

  // ── Filtrar por tipo + búsqueda ──
  const filtrados = useMemo(() => {
    return todos.filter(e => {
      const pasaTipo = filtro === 'todos' || e.tipo_nombre?.toLowerCase() === filtro
      const pasaBusq = !busqueda || e.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      return pasaTipo && pasaBusq
    })
  }, [todos, filtro, busqueda])

  // ── Establecimientos visibles en el área actual del mapa ──
  const [visiblesEnMapa, setVisiblesEnMapa] = useState([])
  useEffect(() => {
    if (!bounds) { 
      setVisiblesEnMapa(filtrados); 
      return 
    }
  
    setVisiblesEnMapa(
      filtrados.filter(e => {
        if (!e.latitud || !e.longitud) return false
        return bounds.contains([parseFloat(e.latitud), parseFloat(e.longitud)])
      })
    )
  }, [filtrados, bounds])

  // ── Contar por tipo visibles ──
  const nTalleres  = visiblesEnMapa.filter(e => e.tipo_nombre?.toLowerCase() === 'taller').length
  const nLavaderos = visiblesEnMapa.filter(e => e.tipo_nombre?.toLowerCase() === 'lavadero').length

  // ── Mi ubicación ──
  function irAMiUbicacion() {
    if (!navigator.geolocation) { setLocationError('Tu navegador no soporta geolocalización'); return }
    setLocationLoading(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude]
        setUserCoords(coords)
        setFlyUser(coords)
        setLocationLoading(false)
      },
      () => {
        setLocationError('No se pudo obtener tu ubicación')
        setLocationLoading(false)
      }
    )
  }

  // ── Click en tarjeta sidebar ──
  function handleSidebarClick(e) {
    setActivoSidebar(e.id)
    setFlyTarget(e)
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  // ── Ordenar sidebar: más cercanos primero si hay ubicación ──
  const sidebarItems = [...visiblesEnMapa].sort((a, b) => {
    if (!userCoords || !a.latitud || !b.latitud) return 0
    const da = distanciaKm(userCoords[0], userCoords[1], parseFloat(a.latitud), parseFloat(a.longitud))
    const db = distanciaKm(userCoords[0], userCoords[1], parseFloat(b.latitud), parseFloat(b.longitud))
    return da - db
  })

  return (
    <div className="flex flex-col h-screen pt-16 bg-gray-50 dark:bg-gray-950">

      {/* ── BARRA SUPERIOR ── */}
      <div className="shrink-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex flex-wrap items-center gap-3 z-20 shadow-sm">

        {/* Buscador */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filtros tipo */}
        <div className="flex gap-1.5">
          {[
            { val: 'todos',    label: 'Todos' },
            { val: 'taller',   label: '🔧 Talleres' },
            { val: 'lavadero', label: '💧 Lavaderos' },
          ].map(f => (
            <button
              key={f.val}
              onClick={() => setFiltro(f.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${filtro === f.val
                  ? f.val === 'taller'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : f.val === 'lavadero'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Contador */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-3">
          {filtro !== 'lavadero' && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              {nTalleres} taller{nTalleres !== 1 ? 'es' : ''}
            </span>
          )}
          {filtro !== 'taller' && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              {nLavaderos} lavadero{nLavaderos !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-gray-300 dark:text-gray-600">en esta área</span>
        </div>

        {/* Botón mi ubicación */}
        <button
          onClick={irAMiUbicacion}
          disabled={locationLoading}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition disabled:opacity-60"
        >
          {locationLoading
            ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
          }
          Mi ubicación
        </button>

        {/* Toggle sidebar mobile */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="lg:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Lista
        </button>
      </div>

      {/* Error ubicación */}
      {locationError && (
        <div className="shrink-0 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 px-4 py-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 z-20">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {locationError}
          <button onClick={() => setLocationError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── LAYOUT PRINCIPAL: SIDEBAR + MAPA ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* SIDEBAR */}
        <aside className={`
          absolute lg:relative z-10 h-full
          w-80 shrink-0
          bg-white/70 dark:bg-gray-900/70 backdrop-blur-md
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

          {/* Header sidebar */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {sidebarItems.length} resultado{sidebarItems.length !== 1 ? 's' : ''}
              </p>
              {userCoords && (
                <p className="text-xs text-blue-500">Ordenados por cercanía</p>
              )}
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Leyenda */}
          <div className="px-4 py-2 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-base">🔧</span> Taller
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-base">💧</span> Lavadero
            </div>
            {userCoords && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow inline-block" />
                Tú
              </div>
            )}
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {sidebarItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-600 gap-2 py-12">
                <span className="text-4xl">🗺️</span>
                <p className="text-sm font-medium">Sin resultados en esta área</p>
                <p className="text-xs">Prueba alejando el mapa o cambia los filtros</p>
              </div>
            ) : (
              sidebarItems.map(e => (
                <TarjetaSidebar
                  key={e.id}
                  e={e}
                  userCoords={userCoords}
                  onClick={handleSidebarClick}
                  activo={activoSidebar === e.id}
                />
              ))
            )}
          </div>
        </aside>

        {/* Overlay sidebar mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden absolute inset-0 z-[9] bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAPA */}
        <div className="flex-1 relative z-0">
          <MapContainer
            center={CENTRO_DEFAULT}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Zoom control manual (reposicionado) */}
            {/* Leaflet por defecto lo pone arriba-izq; lo dejamos con zoomControl default false
                y ponemos uno custom si se requiere. Por ahora Leaflet's built-in es suficiente. */}

            {/* Detección de movimiento del mapa para actualizar lista */}
            <MapBoundsTracker onBoundsChange={handleBoundsChange} />

            {/* Volar a mi ubicación */}
            {flyUser && <FlyToLocation coords={flyUser} />}

            {/* Volar al marcador seleccionado desde sidebar */}
            {flyTarget && <FlyToMarker target={flyTarget} />}

            {/* Marcador usuario */}
            {userCoords && (
              <Marker position={userCoords} icon={iconoUsuario}>
                <Popup>
                  <p className="text-sm font-semibold text-blue-600">📍 Tu ubicación</p>
                </Popup>
              </Marker>
            )}

            {/* Marcadores establecimientos */}
            {filtrados.map(e => {
              if (!e.latitud || !e.longitud) return null
              return (
                <Marker
                  key={e.id}
                  position={[parseFloat(e.latitud), parseFloat(e.longitud)]}
                  icon={esTaller(e) ? iconoTaller : iconoLavadero}
                  eventHandlers={{
                    click: () => setActivoSidebar(e.id),
                  }}
                >
                  <Popup maxWidth={220}>
                    <PopupEstablecimiento e={e} />
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>

          {/* Badge flotante: contador en mapa */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
            <div className="bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-1.5 flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-300">
              {filtro !== 'lavadero' && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  {nTalleres} taller{nTalleres !== 1 ? 'es' : ''}
                </span>
              )}
              {filtro !== 'taller' && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                  {nLavaderos} lavadero{nLavaderos !== 1 ? 's' : ''}
                </span>
              )}
              <span className="text-gray-300 dark:text-gray-600">visible{(nTalleres + nLavaderos) !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapBoundsTracker({ onBoundsChange }) {
  const map = useMapEvents({
    moveend:  () => onBoundsChange(map.getBounds()),
    zoomend:  () => onBoundsChange(map.getBounds()),
    load:     () => onBoundsChange(map.getBounds()),
  })

  return null
}