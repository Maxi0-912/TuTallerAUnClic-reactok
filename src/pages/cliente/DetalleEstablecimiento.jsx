import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── UTILIDADES ──────────────────────────────────────────────────────────────

function Estrellas({ valor, size = 'sm' }) {
  const s = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${s} ${i <= Math.round(valor ?? 0) ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// Cloudinary sirve el original (a veces varios MB) si no se pide una
// transformacion explicita. f_auto/q_auto eligen formato y calidad segun el
// navegador, w_<ancho> evita bajar mas pixeles que los que el contenedor va
// a mostrar.
function cloudinaryOptimizada(url, ancho) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${ancho}/`)
}

function Skeleton({ className = '', style }) {
  return <div className={`animate-pulse bg-slate-700/60 dark:bg-gray-800 rounded ${className}`} style={style} />
}

function estaAbierto(apertura, cierre) {
  if (!apertura || !cierre) return null
  const ahora = new Date()
  const now   = ahora.getHours() * 60 + ahora.getMinutes()
  const [ah, am] = apertura.split(':').map(Number)
  const [ch, cm] = cierre.split(':').map(Number)
  return now >= ah * 60 + am && now <= ch * 60 + cm
}

const HORAS_DISPONIBLES = [
  '08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
]

// ─── GALERÍA ──────────────────────────────────────────────────────────────────

function Galeria({ fotos, fotoPortada }) {
  const [idx, setIdx]   = useState(null)
  const todas = [fotoPortada, ...fotos].filter(Boolean)

  if (todas.length === 0) return null

  return (
    <>
      <div className={`grid gap-2 rounded-2xl overflow-hidden ${
        todas.length === 1 ? 'grid-cols-1' :
        todas.length === 2 ? 'grid-cols-2' :
        'grid-cols-2 md:grid-cols-3'
      }`}>
        {todas.slice(0, 5).map((url, i) => (
          <div key={i}
            onClick={() => setIdx(i)}
            className={`relative cursor-pointer overflow-hidden bg-slate-800 group
              ${i === 0 && todas.length > 2 ? 'row-span-2 col-span-1' : ''}
            `}
            style={{ height: '400px' }}
          >
            <img src={cloudinaryOptimizada(url, 800)} alt={`foto ${i+1}`} width={800} height={400}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {i === 4 && todas.length > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{todas.length - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {idx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIdx(null)}>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + todas.length) % todas.length) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <img src={cloudinaryOptimizada(todas[idx], 1200)} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % todas.length) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button onClick={() => setIdx(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {idx + 1} / {todas.length}
          </div>
        </div>
      )}
    </>
  )
}

// ─── CALENDARIO ──────────────────────────────────────────────────────────────

function Calendario({ establecimientoId, servicioPreseleccionado, anuncioOrigen, anuncios = [], onAgendar }) {
  const { user }  = useAuth()
  const hoy       = new Date()
  const [mes, setMes]         = useState(hoy.getMonth())
  const [anio, setAnio]       = useState(hoy.getFullYear())
  const [diaSeleccionado, setDia] = useState(null)
  const [horaSeleccionada, setHora] = useState(null)
  const [ocupadas, setOcupadas]   = useState([])
  const [servicios, setServicios] = useState([])
  const [servicioSel, setServicio] = useState('')
  const [agendando, setAgendando]  = useState(false)
  const [exito, setExito]          = useState(false)
  const [anuncioConfirmado, setAnuncioConfirmado] = useState(null)
  const [error, setError]          = useState('')
  const [placa, setPlaca]             = useState('')
  const [servicioTexto, setServicioTexto] = useState('')
  const [yaAgendando, setYaAgendando] = useState(false)
  const [anuncioOrigenActivo, setAnuncioOrigenActivo] = useState(anuncioOrigen ?? null)
  const [anuncioOrigenPrevio, setAnuncioOrigenPrevio] = useState(anuncioOrigen ?? null)
  if ((anuncioOrigen ?? null) !== anuncioOrigenPrevio) {
    setAnuncioOrigenPrevio(anuncioOrigen ?? null)
    setAnuncioOrigenActivo(anuncioOrigen ?? null)
  }

  useEffect(() => {
    api.get(`/establecimientos/${establecimientoId}/citas-ocupadas/?mes=${mes+1}&anio=${anio}`)
      .then(res => setOcupadas(res.data))
      .catch(() => {})
    api.get(`/servicios/establecimiento/${establecimientoId}/`)
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : res.data.results ?? []
        setServicios(lista)
        if (servicioPreseleccionado && lista.some(s => String(s.id) === String(servicioPreseleccionado))) {
          setServicio(String(servicioPreseleccionado))
        }
      })
      .catch(() => {})
  }, [mes, anio, establecimientoId, servicioPreseleccionado])

  const anuncioActivo = anuncios.find(a => String(a.id) === String(anuncioOrigenActivo)) ?? null

  function handleCambioServicio(valor) {
    setServicio(valor)
    // El usuario tomo control manual: el anuncio de origen ya no aplica.
    setAnuncioOrigenActivo(null)
  }

  const diasEnMes  = new Date(anio, mes + 1, 0).getDate()
  const primerDia  = new Date(anio, mes, 1).getDay()

  function horasOcupadasEnDia(dia) {
    const fechaStr = `${anio}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    return ocupadas
      .filter(o => o.fecha === fechaStr)
      .map(o => o['agenda__hora']?.slice(0,5))
      .filter(Boolean)
  }

  function diaDeshabilitado(dia) {
    const fecha = new Date(anio, mes, dia)
    return fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  }

  async function handleAgendar() {
    if (yaAgendando) return  // evita doble click
    if (!diaSeleccionado || !horaSeleccionada) return
    if (!user) { setError('Debes iniciar sesion para agendar'); return }
    if (!placa.trim()) { setError('Ingresa la placa de tu vehiculo'); return }

    setAgendando(true); setError('')
    try {
      const fechaStr = `${anio}-${String(mes+1).padStart(2,'0')}-${String(diaSeleccionado).padStart(2,'0')}`
      const res = await api.post('/citas/crear/', {
        establecimiento: establecimientoId,
        fecha:           fechaStr,
        hora:            horaSeleccionada,
        placa:           placa.trim().toUpperCase(),
        servicio:        servicioSel || undefined,
        servicio_texto:  servicioTexto,
        anuncio_origen_id: anuncioOrigenActivo || undefined,
      })
      setExito(true)
      setAnuncioConfirmado(res.data?.anuncio_origen_detalle ?? null)
      setDia(null); setHora(null); setPlaca(''); setServicioTexto('')
      if (onAgendar) onAgendar()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al agendar. Intenta de nuevo.')
    }
    setAgendando(false)
  }

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  return (
    <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
      <h3 className="text-base font-bold text-white mb-4">Agendar cita</h3>

      {anuncioActivo && !exito && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span>
            Agendando desde: <span className="font-semibold">{anuncioActivo.titulo}</span>
            {anuncioActivo.descuento && <span className="font-semibold"> — {anuncioActivo.descuento}</span>}
          </span>
        </div>
      )}

      {exito && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Cita agendada exitosamente
            {anuncioConfirmado && (
              <> — promo aplicada: <span className="font-semibold">{anuncioConfirmado.titulo}</span>
              {anuncioConfirmado.descuento && ` (${anuncioConfirmado.descuento})`}</>
            )}
          </span>
        </div>
      )}

      {/* Navegacion mes */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a-1) } else setMes(m => m-1) }}
          className="w-8 h-8 rounded-lg bg-slate-700 dark:bg-gray-800 hover:bg-slate-600 text-white flex items-center justify-center transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-white font-semibold text-sm">{MESES[mes]} {anio}</span>
        <button onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a+1) } else setMes(m => m+1) }}
          className="w-8 h-8 rounded-lg bg-slate-700 dark:bg-gray-800 hover:bg-slate-600 text-white flex items-center justify-center transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Grilla dias */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
        ))}
        {Array.from({ length: primerDia }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: diasEnMes }).map((_, i) => {
          const dia = i + 1
          const deshabilitado = diaDeshabilitado(dia)
          const horasOc = horasOcupadasEnDia(dia)
          const lleno = horasOc.length >= HORAS_DISPONIBLES.length
          const seleccionado = diaSeleccionado === dia

          return (
            <button key={dia}
              disabled={deshabilitado || lleno}
              onClick={() => { setDia(dia); setHora(null); setExito(false) }}
              className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                seleccionado
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : deshabilitado || lleno
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {dia}
              {horasOc.length > 0 && !lleno && !deshabilitado && (
                <div className="w-1 h-1 rounded-full bg-yellow-400 mx-auto mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Horas disponibles */}
      {diaSeleccionado && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2 font-medium">Horas disponibles</p>
          <div className="grid grid-cols-4 gap-1.5">
            {HORAS_DISPONIBLES.map(hora => {
              const ocupada = horasOcupadasEnDia(diaSeleccionado).includes(hora)
              return (
                <button key={hora}
                  disabled={ocupada}
                  onClick={() => setHora(hora)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    ocupada
                      ? 'bg-red-900/30 text-red-400/50 cursor-not-allowed line-through'
                      : horaSeleccionada === hora
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-700 dark:bg-gray-800 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  {hora}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {diaSeleccionado && horaSeleccionada && (
    <>
      {/* Placa */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2 font-medium">Placa del vehiculo *</p>
        <input
          type="text" value={placa}
          onChange={e => setPlaca(e.target.value.toUpperCase())}
          maxLength={8}
          placeholder="ej: ABC123"
          className="w-full px-3 py-2 text-sm rounded-lg bg-slate-700 dark:bg-gray-800 border border-slate-600 dark:border-gray-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"
        />
      </div>

      {/* Servicio de la lista */}
      {servicios.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-2 font-medium">Servicio del establecimiento</p>
          <select value={servicioSel} onChange={e => handleCambioServicio(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-700 dark:bg-gray-800 border border-slate-600 dark:border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Seleccionar —</option>
            {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      )}

      {/* Servicio libre */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2 font-medium">
          {servicios.length > 0 ? '¿O necesitas algo más?' : '¿Qué necesitas?'}
        </p>
        <input
          type="text" value={servicioTexto}
          onChange={e => setServicioTexto(e.target.value)}
          placeholder="ej: Cambio de aceite, revisión de frenos..."
          className="w-full px-3 py-2 text-sm rounded-lg bg-slate-700 dark:bg-gray-800 border border-slate-600 dark:border-gray-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  )}

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <button
        onClick={handleAgendar}
        disabled={!diaSeleccionado || !horaSeleccionada || agendando}
        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {agendando && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
        {agendando ? 'Agendando...' : diaSeleccionado && horaSeleccionada
          ? `Agendar para el ${diaSeleccionado} a las ${horaSeleccionada}`
          : 'Selecciona fecha y hora'}
      </button>

      {!user && (
        <p className="text-xs text-slate-400 text-center mt-2">
          <Link to="/login" className="text-blue-400 hover:underline">Inicia sesion</Link> para agendar
        </p>
      )}
    </div>
  )
}

// ─── ANUNCIOS DEL ESTABLECIMIENTO ─────────────────────────────────────────────

function AnuncioAccionIcon({ accion }) {
  if (accion === 'agendar') {
    return (
      <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </span>
    )
  }
  if (accion === 'enlace') {
    return (
      <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </span>
    )
  }
  return null
}

function SeccionAnuncios({ establecimientoId, anuncios, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (anuncios.length === 0) return null

  function handleClick(a) {
    if (a.accion === 'agendar' && a.servicio) {
      navigate(`/establecimientos/${establecimientoId}?servicio=${a.servicio.id}&anuncio=${a.id}`)
      document.getElementById('calendario-agendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (a.accion === 'enlace' && a.url_boton) {
      window.open(a.url_boton, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
      <h3 className="text-base font-bold text-white mb-4">Anuncios y promociones</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {anuncios.map(a => (
          <div key={a.id}
            onClick={() => handleClick(a)}
            className={`group relative rounded-xl overflow-hidden h-40 transition-transform ${
              a.accion ? 'cursor-pointer hover:scale-[1.02]' : ''
            }`}
          >
            {a.imagen_url ? (
              <img src={cloudinaryOptimizada(a.imagen_url, 400)} alt={a.titulo} width={400} height={160}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 bg-slate-700 dark:bg-gray-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <AnuncioAccionIcon accion={a.accion} />
            {a.descuento && (
              <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg">
                {a.descuento}
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {a.titulo && <h4 className="text-white text-sm font-bold mb-1">{a.titulo}</h4>}
              {a.descripcion && <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{a.descripcion}</p>}
              {a.accion === 'agendar' && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-blue-300">
                  Agendar
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── RESEÑAS ─────────────────────────────────────────────────────────────────

function Resenas({ establecimientoId }) {
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/establecimientos/${establecimientoId}/resenas/`)
      .then(res => { setResenas(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [establecimientoId])

  if (loading) return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-700 dark:border-gray-700">
        <Skeleton className="w-14 h-14 shrink-0" />
        <Skeleton className="flex-1 h-8" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  )

  if (resenas.length === 0) return (
    <p className="text-slate-400 text-sm">Aun no hay reseñas para este establecimiento.</p>
  )

  const promedio = resenas.reduce((acc, r) => acc + r.puntuacion, 0) / resenas.length

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-700 dark:border-gray-700">
        <div className="text-center">
          <p className="text-4xl font-black text-white">{promedio.toFixed(1)}</p>
          <Estrellas valor={promedio} size="lg" />
          <p className="text-xs text-slate-400 mt-1">{resenas.length} reseñas</p>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {[5,4,3,2,1].map(n => {
            const count = resenas.filter(r => Math.round(r.puntuacion) === n).length
            const pct   = resenas.length > 0 ? (count / resenas.length) * 100 : 0
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-2">{n}</span>
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 h-1.5 rounded-full bg-slate-700 dark:bg-gray-800">
                  <div className="h-1.5 rounded-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-4">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista */}
      {resenas.map((r, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
            {r.foto_url
              ? <img src={r.foto_url} alt={r.usuario} className="w-full h-full object-cover" />
              : <span className="text-white text-xs font-bold">{r.usuario?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">{r.usuario}</p>
              <p className="text-xs text-slate-500">{r.fecha}</p>
            </div>
            <Estrellas valor={r.puntuacion} />
            {r.comentario && (
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{r.comentario}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── DETALLE PRINCIPAL ────────────────────────────────────────────────────────

export default function DetalleEstablecimiento() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const servicioPreseleccionado = searchParams.get('servicio')
  const anuncioOrigen           = searchParams.get('anuncio')
  const [estab, setEstab]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [anuncios, setAnuncios] = useState([])
  const [anunciosLoading, setAnunciosLoading] = useState(true)

  // Estas dos llamadas comparten el mismo "id" de entrada, no dependen una de
  // la otra, asi que se disparan juntas en el primer render en vez de esperar
  // a que termine el fetch del establecimiento.
  useEffect(() => {
    api.get(`/establecimientos/${id}/`)
      .then(res => { setEstab(res.data); setLoading(false) })
      .catch(() => { setLoading(false); navigate('/establecimientos') })
  }, [id])

  useEffect(() => {
    api.get(`/anuncios/?establecimiento=${id}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results ?? []
        setAnuncios(data.filter(a => String(a.establecimiento) === String(id)))
      })
      .catch(() => setAnuncios([]))
      .finally(() => setAnunciosLoading(false))
  }, [id])

  if (!loading && !estab) return null

  const abierto = estab ? estaAbierto(estab.hora_apertura, estab.hora_cierre) : null

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/inicio" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/establecimientos" className="hover:text-white transition-colors">Establecimientos</Link>
          <span>/</span>
          {estab ? <span className="text-white">{estab.nombre}</span> : <Skeleton className="h-3 w-24 inline-block align-middle" />}
        </div>

        {/* Header info */}
        {estab ? (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  {estab.tipo_nombre}
                </span>
                {abierto !== null && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    abierto ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                             : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}>
                    {abierto ? '● Abierto ahora' : '● Cerrado'}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-white">{estab.nombre}</h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {estab.direccion}
              </p>
              {estab.calificacion_promedio && (
                <div className="flex items-center gap-2 mt-2">
                  <Estrellas valor={estab.calificacion_promedio} />
                  <span className="text-sm text-white font-semibold">{estab.calificacion_promedio}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {estab.telefono && (
                <a href={`tel:${estab.telefono}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 dark:bg-gray-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {estab.telefono}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        )}

        {/* Galería */}
        <div className="mb-8">
          {estab ? (
            <Galeria fotos={estab.fotos_galeria ?? []} fotoPortada={estab.foto_url} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              <Skeleton className="row-span-2 col-span-1" style={{ height: '400px' }} />
              <Skeleton style={{ height: '400px' }} />
              <Skeleton style={{ height: '400px' }} />
            </div>
          )}
        </div>

        {/* Layout 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna principal */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Descripcion */}
            {estab?.descripcion && (
              <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
                <h3 className="text-base font-bold text-white mb-3">Sobre el establecimiento</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{estab.descripcion}</p>
              </div>
            )}

            {/* Horarios e info */}
            <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
              <h3 className="text-base font-bold text-white mb-4">Informacion</h3>
              {estab ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Horario</p>
                      <p className="text-sm text-white font-medium">
                        {estab.hora_apertura?.slice(0,5)} – {estab.hora_cierre?.slice(0,5)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Telefono</p>
                      <p className="text-sm text-white font-medium">{estab.telefono || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Direccion</p>
                      <p className="text-sm text-white font-medium">{estab.direccion}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Tipo</p>
                      <p className="text-sm text-white font-medium">{estab.tipo_nombre}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="w-8 h-8 shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-14 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anuncios */}
            <SeccionAnuncios establecimientoId={id} anuncios={anuncios} loading={anunciosLoading} />

            {/* Mapa */}
            {estab ? (
              estab.latitud && estab.longitud && (
                <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
                  <h3 className="text-base font-bold text-white mb-4">Ubicacion</h3>
                  <div className="rounded-xl overflow-hidden" style={{ height: '280px' }}>
                    <MapContainer
                      center={[parseFloat(estab.latitud), parseFloat(estab.longitud)]}
                      zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[parseFloat(estab.latitud), parseFloat(estab.longitud)]}>
                        <Popup>{estab.nombre}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
                <Skeleton className="h-5 w-24 mb-4" />
                <Skeleton style={{ height: '280px' }} />
              </div>
            )}

            {/* Reseñas */}
            <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
              <h3 className="text-base font-bold text-white mb-4">Reseñas</h3>
              <Resenas establecimientoId={id} />
            </div>
          </div>

          {/* Columna lateral — Calendario */}
          <div className="lg:col-span-1">
            <div id="calendario-agendar" className="sticky top-24">
              <Calendario establecimientoId={id}
                servicioPreseleccionado={servicioPreseleccionado}
                anuncioOrigen={anuncioOrigen}
                anuncios={anuncios}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}