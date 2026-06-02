import { useState, useEffect } from 'react'
import api from '../../services/api'

const ESTADOS = [
  { value: 'pendiente',  label: 'Pendiente',  color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' },
  { value: 'confirmada', label: 'Confirmada', color: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
  { value: 'finalizada', label: 'Finalizada', color: 'bg-green-500/20 border-green-500/30 text-green-400' },
  { value: 'cancelada',  label: 'Cancelada',  color: 'bg-red-500/20 border-red-500/30 text-red-400' },
]

function BadgeEstado({ estado }) {
  const cfg = ESTADOS.find(e => e.value === estado) ?? ESTADOS[0]
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function ModalCambiarEstado({ cita, onClose, onGuardado }) {
  const [estado, setEstado]   = useState(cita.estado)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const OPCIONES = ESTADOS.filter(e => e.value !== 'pendiente' || cita.estado === 'pendiente')

  async function handleGuardar() {
    if (estado === cita.estado) { onClose(); return }
    setSaving(true); setError('')
    try {
      await api.patch(`/citas/${cita.id}/estado/`, { estado })
      onGuardado()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al cambiar estado')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Cambiar estado</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          {cita.usuario_nombre} · {cita.establecimiento_nombre} · {cita.fecha}
        </p>

        <div className="flex flex-col gap-2 mb-5">
          {OPCIONES.map(op => (
            <button key={op.value} onClick={() => setEstado(op.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                estado === op.value
                  ? `${op.color} border-current`
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 ${
                estado === op.value ? 'border-current' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {estado === op.value && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <span className="text-sm font-medium">{op.label}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {saving ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalComentario({ cita, onClose, onGuardado }) {
  const [comentario, setComentario] = useState(cita.comentario_empresa ?? '')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  async function handleGuardar() {
    if (!comentario.trim()) { setError('Escribe un comentario'); return }
    setSaving(true); setError('')
    try {
      await api.patch(`/citas/${cita.id}/comentario/`, { comentario_empresa: comentario.trim() })
      onGuardado()
      onClose()
    } catch {
      setError('Error al guardar el comentario')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Comentario del servicio</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          {cita.usuario_nombre} · {cita.establecimiento_nombre} · {cita.fecha}
        </p>

        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          rows={4}
          placeholder="Escribe las observaciones del servicio realizado..."
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
        />

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar comentario'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TarjetaCita({ cita, onCambiarEstado, onAgregarComentario }) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100">{cita.usuario_nombre}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cita.establecimiento_nombre}</p>
        </div>
        <BadgeEstado estado={cita.estado} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Fecha',    value: cita.fecha },
          { label: 'Hora',     value: cita.hora?.slice(0,5) },
          { label: 'Vehiculo', value: cita.vehiculo_placa, mono: true },
          { label: 'Telefono', value: cita.usuario_telefono || '—' },
        ].map(item => (
          <div key={item.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">{item.label}</p>
            <p className={`text-sm font-medium text-gray-800 dark:text-gray-100 mt-0.5 ${item.mono ? 'tracking-widest' : ''}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {(cita.servicio_nombre || cita.servicio_texto) && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-400 mb-0.5">Servicio solicitado</p>
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            {cita.servicio_nombre ?? cita.servicio_texto}
          </p>
        </div>
      )}

      {cita.descripcion && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Observación del cliente</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{cita.descripcion}</p>
        </div>
      )}

      {cita.notas && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
          "{cita.notas}"
        </p>
      )}

      {cita.estado === 'finalizada' && (
        cita.comentario_empresa ? (
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
            <p className="text-xs text-green-500 mb-0.5">Comentario de la empresa</p>
            <p className="text-sm text-green-800 dark:text-green-200">{cita.comentario_empresa}</p>
          </div>
        ) : (
          <button onClick={() => onAgregarComentario(cita)}
            className="w-full py-2 rounded-xl border border-green-400 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 text-xs font-semibold transition-colors">
            + Agregar comentario del servicio
          </button>
        )
      )}

      {cita.estado !== 'cancelada' && cita.estado !== 'finalizada' && (
        <button onClick={() => onCambiarEstado(cita)}
          className="w-full py-2 rounded-xl border border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-semibold transition-colors">
          Cambiar estado
        </button>
      )}
    </div>
  )
}

export default function Citas() {
  const [citas, setCitas]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [filtroEstab, setFiltroEstab]   = useState('todos')
  const [busqueda, setBusqueda]         = useState('')
  const [citaModal, setCitaModal]             = useState(null)
  const [comentarioModal, setComentarioModal] = useState(null)

  useEffect(() => { fetchCitas() }, [])

  async function fetchCitas() {
    try {
      const res = await api.get('/empresa/citas/')
      setCitas(Array.isArray(res.data) ? res.data : res.data.results ?? [])
    } catch {}
    setLoading(false)
  }

  // Lista única de establecimientos para el filtro
  const establecimientos = [...new Map(
    citas.map(c => [c.establecimiento_id, { id: c.establecimiento_id, nombre: c.establecimiento_nombre }])
  ).values()]

  const filtradas = citas.filter(c => {
    const pasaEstado = filtroEstado === 'todas' || c.estado === filtroEstado
    const pasaEstab  = filtroEstab === 'todos'  || String(c.establecimiento_id) === filtroEstab
    const pasaBusq   = !busqueda || c.usuario_nombre.toLowerCase().includes(busqueda.toLowerCase())
    return pasaEstado && pasaEstab && pasaBusq
  })

  const contadores = ESTADOS.reduce((acc, e) => {
    acc[e.value] = citas.filter(c => c.estado === e.value).length
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Citas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {citas.length} cita{citas.length !== 1 ? 's' : ''} en total
        </p>
      </div>

      {/* Contadores rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ESTADOS.map(e => (
          <button key={e.value} onClick={() => setFiltroEstado(e.value === filtroEstado ? 'todas' : e.value)}
            className={`rounded-xl border p-3 text-left transition-all ${
              filtroEstado === e.value ? `${e.color} border-current` : 'bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}>
            <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{contadores[e.value] ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{e.label}{contadores[e.value] !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {establecimientos.length > 1 && (
          <select value={filtroEstab} onChange={e => setFiltroEstab(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="todos">Todos los establecimientos</option>
            {establecimientos.map(e => <option key={e.id} value={String(e.id)}>{e.nombre}</option>)}
          </select>
        )}

        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="todas">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
          </svg>
          <p className="text-gray-400 text-sm">No hay citas con estos filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtradas.map(c => (
            <TarjetaCita key={c.id} cita={c} onCambiarEstado={setCitaModal} onAgregarComentario={setComentarioModal} />
          ))}
        </div>
      )}

      {citaModal && (
        <ModalCambiarEstado
          cita={citaModal}
          onClose={() => setCitaModal(null)}
          onGuardado={fetchCitas}
        />
      )}

      {comentarioModal && (
        <ModalComentario
          cita={comentarioModal}
          onClose={() => setComentarioModal(null)}
          onGuardado={fetchCitas}
        />
      )}
    </div>
  )
}