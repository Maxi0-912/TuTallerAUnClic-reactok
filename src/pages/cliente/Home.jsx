import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../../services/api'

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── HERO ────────────────────────────────────────────────────────────────────

const FRASES = [
  'Tu taller de confianza,',
  'Servicio garantizado,',
  'A un solo clic,',
]

function HeroSection({ stats }) {
  const [fraseIdx, setFraseIdx] = useState(0)
  const [visible, setVisible]   = useState(true)
  const [scrollY, setScrollY]   = useState(0)

  useEffect(() => {
    function onScroll() { setScrollY(window.scrollY) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setFraseIdx(i => (i + 1) % FRASES.length); setVisible(true) }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/*
        VIDEO: cuando tengas hero-video.mp4, comenta el div de imagen y descomenta esto:
        <video autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}>
          <source src="/img/hero-video.mp4" type="video/mp4" />
        </video>
      */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/img/hero.png)', transform: `translateY(${scrollY * 0.35}px)`, willChange: 'transform' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-transparent to-blue-950/20" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-200 text-xs font-medium tracking-widest uppercase">Talleres y lavaderos</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-2 drop-shadow-2xl">
          <span className="block transition-all duration-400"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-12px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
            {FRASES[fraseIdx]}
          </span>
          <span className="block text-blue-400 mt-1">cuando lo necesitas.</span>
        </h1>

        <p className="text-white/70 text-lg mt-6 mb-10 max-w-xl mx-auto leading-relaxed">
          Encuentra talleres y lavaderos cerca de ti. Agenda tu cita, califica el servicio y lleva el historial de tu vehiculo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/establecimientos"
            className="group px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-900/40 hover:shadow-blue-700/50 hover:-translate-y-0.5 flex items-center gap-2">
            Buscar ahora
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link to="/mapa"
            className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-sm border border-white/20 transition-all duration-200 hover:-translate-y-0.5">
            Ver mapa
          </Link>
        </div>

        {/* Stats reales */}
        <div className="flex items-center justify-center gap-8 mt-14">
          {[
            { valor: stats ? `${stats.total_establecimientos}+` : '…', label: 'Establecimientos' },
            { valor: stats ? `${stats.total_usuarios}+`         : '…', label: 'Clientes' },
            { valor: stats ? `${stats.calificacion_promedio}★`  : '…', label: 'Calificacion' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-white">{s.valor}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-bounce" />
      </div>
    </section>
  )
}

// ─── CARRUSEL ─────────────────────────────────────────────────────────────────

function CarruselAnuncios({ anuncios }) {
  const [current, setCurrent]     = useState(0)
  const [paused, setPaused]       = useState(false)
  const [dragging, setDragging]   = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const total = anuncios.length

  const next = useCallback(() => setCurrent(i => (i + 1) % total), [total])
  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total])

  useEffect(() => {
    if (paused || total === 0) return
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [paused, next, total])

  function onTouchStart(e) { setDragStart(e.touches[0].clientX); setDragging(true) }
  function onTouchEnd(e) {
    if (!dragging) return
    const diff = dragStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setDragging(false)
  }
  function onMouseDown(e) { setDragStart(e.clientX); setDragging(true) }
  function onMouseUp(e) {
    if (!dragging) return
    const diff = dragStart - e.clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setDragging(false)
  }

  if (total === 0) return null
  const anuncio = anuncios[current]

  return (
    <section className="py-16 px-4">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">Anuncios y promociones</h2>
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none"
          style={{ height: 'clamp(200px, 40vw, 800px)' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); setDragging(false) }}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}   onMouseUp={onMouseUp}
        >
          {anuncios.map((a, i) => (
            <div key={a.id} className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}>
              <img src={a.imagen_url} alt={a.titulo} className="w-full h-full object-cover" draggable={false} />
              {(a.tipo === 'imagen_texto' || a.tipo === 'imagen_boton') && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
                  <div className="px-10 max-w-lg">
                    {a.titulo && <h3 className="text-white text-2xl sm:text-3xl font-black mb-2 drop-shadow-lg">{a.titulo}</h3>}
                    {a.descripcion && <p className="text-white/80 text-sm sm:text-base mb-4 leading-relaxed">{a.descripcion}</p>}
                    {a.tipo === 'imagen_boton' && a.texto_boton && a.url_boton && (
                      <Link to={a.url_boton} onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg">
                        {a.texto_boton}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110 z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110 z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {anuncios.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i) }}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 h-0.5 bg-blue-400/70 z-10"
            style={{ animation: 'progress-bar 4.5s linear infinite', animationPlayState: paused ? 'paused' : 'running' }} />
        </div>
      </div>
    </section>
  )
}

// ─── CARDS TALLERES Y LAVADEROS ───────────────────────────────────────────────

function SeccionCategories() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">¿Qué necesitas hoy?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Encuentra el servicio perfecto para tu vehiculo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Talleres */}
          <Link to="/establecimientos?tipo=taller"
            className="group relative rounded-2xl overflow-hidden shadow-xl h-72 cursor-pointer">
            <img src="/img/talleres.jpg" alt="Talleres"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/10 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl"></span>
                <h3 className="text-white text-2xl font-black">Talleres</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">Mecanica, electricidad, frenos, suspension y mas</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium group-hover:bg-white/30 transition-colors">
                Ver talleres
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Lavaderos */}
          <Link to="/establecimientos?tipo=lavadero"
            className="group relative rounded-2xl overflow-hidden shadow-xl h-72 cursor-pointer">
            <img src="/img/lavaderos.jpg" alt="Lavaderos"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-cyan-900/20 group-hover:bg-cyan-900/10 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl"></span>
                <h3 className="text-white text-2xl font-black">Lavaderos</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">Lavado basico, detailing, encerado y mas</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium group-hover:bg-white/30 transition-colors">
                Ver lavaderos
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  )
}

// ─── CÓMO FUNCIONA ────────────────────────────────────────────────────────────

function SeccionComoFunciona() {
  const pasos = [
    {
      num: '01',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      titulo: 'Busca',
      desc: 'Encuentra talleres y lavaderos cerca de ti usando el buscador o el mapa interactivo.',
    },
    {
      num: '02',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      titulo: 'Agenda',
      desc: 'Selecciona el servicio que necesitas y elige la fecha y hora que mas te convenga.',
    },
    {
      num: '03',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titulo: '¡Listo!',
      desc: 'Lleva tu vehiculo, recibe el servicio y califica tu experiencia para ayudar a otros.',
    },
  ]

  return (
    <section className="py-20 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">¿Cómo funciona?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Tres pasos simples para cuidar tu vehiculo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Linea conectora desktop */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 dark:from-blue-700 dark:via-blue-500 dark:to-blue-700" />

          {pasos.map((paso, i) => (
            <div key={paso.num} className="flex flex-col items-center text-center relative">
              {/* Numero + icono */}
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 relative z-10">
                  {paso.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-600 text-blue-600 text-xs font-black flex items-center justify-center z-20">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{paso.titulo}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">{paso.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── MAPA PREVIEW ─────────────────────────────────────────────────────────────

function SeccionMapaPreview({ establecimientos }) {
  const centro = [2.4419, -76.6063] // Bogotá por defecto

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cerca de ti</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {establecimientos.length} establecimientos registrados
            </p>
          </div>
          <Link to="/mapa"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
            Ver mapa completo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700" style={{ height: '380px' }}>
          <MapContainer center={centro} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {establecimientos.map(e => {
              if (!e.latitud || !e.longitud) return null
              return (
                <Marker key={e.id} position={[parseFloat(e.latitud), parseFloat(e.longitud)]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{e.nombre}</p>
                      <p className="text-gray-500 text-xs">{e.direccion}</p>
                      <Link to={`/establecimientos/${e.id}`} className="text-blue-600 text-xs hover:underline">
                        Ver detalle →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </div>
    </section>
  )
}

// ─── SECCIÓN FINAL: PRUEBA SOCIAL ────────────────────────────────────────────

function useCountUp(target, duration = 1500, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active || !target) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, active])
  return count
}

function SeccionFinal({ stats }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const talleres = useCountUp(stats?.total_establecimientos ?? 0, 1500, visible)
  const clientes = useCountUp(stats?.total_usuarios ?? 0, 1800, visible)
  const citas    = useCountUp(stats?.total_prestaciones ?? 0, 2000, visible)

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl">

          {/* Imagen */}
          <div className="relative h-72 md:h-auto min-h-[320px]">
            <img src="/img/social.png" alt="Servicio automotriz"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-950/60 md:bg-gradient-to-l" />
            {/* Badge flotante */}
            <div className="absolute bottom-6 left-6 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100">Servicio verificado</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Talleres y lavaderos certificados</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="bg-blue-950 dark:bg-blue-950 p-8 md:p-10 flex flex-col justify-center">
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">Por qué elegirnos</span>
            <h2 className="text-3xl font-black text-white leading-tight mb-4">
              Tu vehiculo en <span className="text-blue-400">las mejores manos</span>
            </h2>
            <p className="text-blue-200/70 text-sm leading-relaxed mb-8">
              Conectamos conductores con talleres y lavaderos de confianza. Cada establecimiento es verificado, cada servicio es evaluado por usuarios reales como tú.
            </p>

            {/* Stats animadas */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { valor: talleres, sufijo: '+', label: 'Establecimientos' },
                { valor: clientes, sufijo: '+', label: 'Clientes' },
                { valor: citas,    sufijo: '+', label: 'Servicios' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black text-white">
                    {visible ? s.valor : 0}{s.sufijo}
                  </p>
                  <p className="text-xs text-blue-300/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3 mb-8">
              {[
                'Agenda en minutos, sin llamadas',
                'Historial completo de tu vehiculo',
                'Calificaciones reales de usuarios',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-blue-100/80 text-sm">{f}</span>
                </div>
              ))}
            </div>

            <Link to="/buscar"
              className="self-start inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-800 font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg">
              Comenzar ahora
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
// ─── HOME PRINCIPAL ───────────────────────────────────────────────────────────

export default function Home() {
  const [anuncios, setAnuncios]               = useState([])
  const [establecimientos, setEstablecimientos] = useState([])
  const [stats, setStats]                     = useState(null)

  useEffect(() => {
    // Anuncios publicos
    api.get('/anuncios/')
      .then(res => setAnuncios(Array.isArray(res.data) ? res.data : res.data.results ?? []))
      .catch(() => setAnuncios([]))

    // Establecimientos para el mapa
    api.get('/establecimientos/')
      .then(res => setEstablecimientos(Array.isArray(res.data) ? res.data : res.data.results ?? []))
      .catch(() => setEstablecimientos([]))

    // Stats publicas — reutilizamos el endpoint del dashboard
    api.get('/stats/')
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
  }, [])

  return (
    <div>
      <HeroSection stats={stats} />
      {anuncios.length > 0 && <CarruselAnuncios anuncios={anuncios} />}
      <SeccionCategories />
      <SeccionComoFunciona />
      <SeccionMapaPreview establecimientos={establecimientos} />
      <SeccionFinal stats={stats} />
    </div>
  )
}