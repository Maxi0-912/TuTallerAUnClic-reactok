import { useState, useEffect } from 'react'
import api from '../../services/api'

const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' },
  confirmada: { label: 'Confirmada', color: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
  cancelada:  { label: 'Cancelada',  color: 'bg-red-500/20 border-red-500/30 text-red-400' },
  finalizada: { label: 'Finalizada', color: 'bg-green-500/20 border-green-500/30 text-green-400' },
}

function Estrellas({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <svg className={`w-6 h-6 ${i <= (hover || value) ? 'text-yellow-400' : 'text-slate-600'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function ModalResena({ cita, onClose, onGuardada }) {
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  async function handleGuardar() {
    if (!puntuacion) { setError('Selecciona una calificacion'); return }
    setSaving(true)
    try {
      await api.post('/calificaciones/crear/', {
        prestacion: cita.id,
        puntuacion,
        comentario,
      })
      onGuardada()
      onClose()
    } catch {
      setError('Error al guardar la reseña')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-6 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1">Calificar servicio</h3>
        <p className="text-xs text-slate-400 mb-5">
          {cita.establecimiento_nombre} · {cita.fecha}
        </p>

        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Calificacion *</p>
          <Estrellas value={puntuacion} onChange={setPuntuacion} />
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Comentario</p>
          <textarea
            value={comentario} onChange={e => setComentario(e.target.value)}
            rows={3} placeholder="Cuenta tu experiencia..."
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-700 dark:bg-gray-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {saving ? 'Guardando...' : 'Publicar reseña'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalDetalleCita({ cita, onClose, onResenar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">{cita.establecimiento_nombre}</h3>
              <p className="text-xs text-white/70 mt-0.5">Cita #{cita.id} · {cita.fecha}</p>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fecha',    value: cita.fecha },
              { label: 'Hora',     value: cita.hora?.slice(0,5) },
              { label: 'Vehículo', value: cita.vehiculo_placa },
              { label: 'Estado',   value: cita.estado },
            ].map(item => (
              <div key={item.label} className="bg-slate-700/50 rounded-xl px-3 py-2">
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-sm text-white font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {(cita.servicio_nombre || cita.servicio_texto) && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-400 mb-1">Servicio</p>
              <p className="text-sm text-blue-200 font-medium">
                {cita.servicio_nombre ?? cita.servicio_texto}
              </p>
            </div>
          )}

          {cita.descripcion && (
            <div className="bg-slate-700/50 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">Tu solicitud</p>
              <p className="text-sm text-slate-200">{cita.descripcion}</p>
            </div>
          )}

          {cita.comentario_empresa ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-xs text-green-400 font-medium">Comentario del taller</p>
              </div>
              <p className="text-sm text-green-200">{cita.comentario_empresa}</p>
            </div>
          ) : (
            <div className="bg-slate-700/30 rounded-xl px-4 py-3 border border-dashed border-slate-600">
              <p className="text-xs text-slate-500 text-center">El taller aún no ha agregado comentarios</p>
            </div>
          )}

          {cita.tiene_resena ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
              <p className="text-xs text-yellow-400 mb-1">Tu reseña</p>
              <p className="text-sm text-yellow-200">Ya calificaste este servicio ★</p>
            </div>
          ) : (
            <button onClick={() => { onClose(); onResenar(cita) }}
              className="w-full py-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Calificar este servicio
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TarjetaCita({ cita, onCancelar, onResenar, onEditar, onEliminar, onVerDetalle }) {
  const cfg = ESTADO_CONFIG[cita.estado] ?? ESTADO_CONFIG.pendiente
  const [confirmando, setConfirmando] = useState(false)

  return (
    <div className="bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 dark:border-gray-700 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-base">{cita.establecimiento_nombre}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {cita.servicio_nombre ?? cita.servicio_texto ?? 'Sin servicio especificado'}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoItem label="Fecha"    value={cita.fecha} />
        <InfoItem label="Hora"     value={cita.hora?.slice(0,5)} />
        <InfoItem label="Vehiculo" value={cita.vehiculo_placa} mono />
      </div>

      {cita.notas && (
        <p className="text-xs text-slate-400 bg-slate-700/50 rounded-lg px-3 py-2 italic">
          "{cita.notas}"
        </p>
      )}

      <div className="flex gap-2 pt-1 border-t border-slate-700 dark:border-gray-800 flex-wrap">

        {/* Pendiente: editar + cancelar */}
        {cita.estado === 'pendiente' && !confirmando && (
          <>
            <button onClick={() => onEditar(cita)}
              className="flex-1 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs font-medium transition-colors">
              Editar
            </button>
            <button onClick={() => setConfirmando(true)}
              className="flex-1 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors">
              Cancelar cita
            </button>
          </>
        )}

        {/* Confirmacion de cancelacion */}
        {cita.estado === 'pendiente' && confirmando && (
          <>
            <button onClick={() => setConfirmando(false)}
              className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-400 hover:bg-slate-700 text-xs transition-colors">
              No
            </button>
            <button onClick={() => { setConfirmando(false); onCancelar(cita.id) }}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors">
              Confirmar cancelacion
            </button>
          </>
        )}

        {/* Confirmada: solo info */}
        {cita.estado === 'confirmada' && (
          <p className="flex-1 py-2 text-center text-xs text-slate-500">
            Cita confirmada por el taller
          </p>
        )}

        {/* Finalizada: ver detalle */}
        {cita.estado === 'finalizada' && (
          <button onClick={() => onVerDetalle(cita)}
            className="flex-1 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ver detalle
          </button>
        )}

        {/* Cancelada: eliminar */}
        {cita.estado === 'cancelada' && (
          <button onClick={() => onEliminar(cita.id)}
            className="flex-1 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors">
            Eliminar registro
          </button>
        )}

      </div>
    </div>
  )
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-xs text-white font-medium ${mono ? 'tracking-widest' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

export default function MisCitas() {
  const [citas, setCitas]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filtro, setFiltro]       = useState('todas')
  const [citaResena, setCitaResena]     = useState(null)
  const [citaDetalle, setCitaDetalle]   = useState(null)
  const [citaEditando, setCitaEditando] = useState(null)
  const [editForm, setEditForm]         = useState({ fecha: '', hora: '' })
  const [editando, setEditando]         = useState(false)
  const [editError, setEditError]       = useState('')

  const HORAS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

  useEffect(() => { fetchCitas() }, [])

  async function fetchCitas() {
    try {
      const res = await api.get('/citas/mis-citas/')
      setCitas(Array.isArray(res.data) ? res.data : res.data.results ?? [])
    } catch {}
    setLoading(false)
  }

  async function handleCancelar(id) {
    try {
      await api.patch(`/citas/${id}/estado/`, { estado: 'cancelada' })
      fetchCitas()
    } catch {}
  }

  function abrirEdicion(cita) {
  setCitaEditando(cita)
  setEditForm({ fecha: cita.fecha, hora: cita.hora?.slice(0,5) })
  setEditError('')
}

async function handleEditar() {
  if (!editForm.fecha || !editForm.hora) return
  setEditando(true); setEditError('')
  try {
    await api.patch(`/citas/${citaEditando.id}/editar/`, {
      fecha: editForm.fecha,
      hora:  editForm.hora,
    })
    setCitaEditando(null)
    fetchCitas()
  } catch (err) {
    setEditError(err.response?.data?.error ?? 'Error al editar')
  }
  setEditando(false)
}

async function handleEliminar(id) {
  try {
    await api.delete(`/citas/${id}/`)
    fetchCitas()
  } catch {}
}

  const filtradas = filtro === 'todas'
    ? citas
    : citas.filter(c => c.estado === filtro)

  const FILTROS = [
    { key: 'todas',     label: 'Todas' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'confirmada',label: 'Confirmadas' },
    { key: 'finalizada',label: 'Finalizadas' },
    { key: 'cancelada', label: 'Canceladas' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Mis citas</h1>
          <p className="text-slate-400 text-sm mt-1">Historial y gestión de tus citas</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTROS.map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                filtro === f.key
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              }`}>
              {f.label}
              {f.key !== 'todas' && (
                <span className="ml-1.5 opacity-60">
                  {citas.filter(c => c.estado === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
            </svg>
            <p className="text-slate-400 text-sm">No tienes citas {filtro !== 'todas' ? filtro + 's' : ''}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtradas.map(c => (
              <TarjetaCita key={c.id} cita={c}
                onCancelar={handleCancelar}
                onResenar={setCitaResena}
                onEditar={abrirEdicion}
                onEliminar={handleEliminar}
                onVerDetalle={setCitaDetalle} />
            ))}
          </div>
        )}
      </div>

      {citaEditando && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCitaEditando(null)} />
        <div className="relative z-10 w-full max-w-sm bg-slate-800 dark:bg-gray-900 rounded-2xl border border-slate-700 p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-1">Editar cita</h3>
          <p className="text-xs text-slate-400 mb-5">{citaEditando.establecimiento_nombre}</p>

          <div className="flex flex-col gap-4 mb-5">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Nueva fecha</label>
              <input type="date" value={editForm.fecha}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Nueva hora</label>
              <select value={editForm.hora}
                onChange={e => setEditForm(f => ({ ...f, hora: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {editError && <p className="text-xs text-red-400 mb-3">{editError}</p>}

          <div className="flex gap-3">
            <button onClick={() => setCitaEditando(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm transition-colors">
              Cancelar
            </button>
            <button onClick={handleEditar} disabled={editando}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              {editando && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              {editando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    )}

      {citaDetalle && (
        <ModalDetalleCita
          cita={citaDetalle}
          onClose={() => setCitaDetalle(null)}
          onResenar={cita => { setCitaDetalle(null); setCitaResena(cita) }}
        />
      )}

      {citaResena && (
        <ModalResena
          cita={citaResena}
          onClose={() => setCitaResena(null)}
          onGuardada={fetchCitas}
        />
      )}
    </div>
  )
}