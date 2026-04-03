import { useState, useEffect } from 'react'
import api from '../../services/api'

const EMPTY = { nombre: '', establecimiento: '', tipo_servicio: '' }

function Field({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}

function Modal({ editing, establecimientos, tiposServicio, onClose, onGuardado }) {
  const [form, setForm] = useState(editing ? {
    nombre:          editing.nombre,
    establecimiento: String(editing.establecimiento_id),
    tipo_servicio:   String(editing.tipo_servicio_id),
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function f(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave() {
    if (!form.nombre || !form.establecimiento || !form.tipo_servicio) {
      setError('Todos los campos son obligatorios'); return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        nombre:          form.nombre,
        establecimiento: parseInt(form.establecimiento),
        tipo_servicio:   parseInt(form.tipo_servicio),
      }
      if (editing) {
        await api.patch(`/empresa/servicios/${editing.id}/`, payload)
      } else {
        await api.post('/empresa/servicios/crear/', payload)
      }
      onGuardado(); onClose()
    } catch { setError('Error al guardar') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {editing ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <Field label="Nombre del servicio *" value={form.nombre} onChange={v => f('nombre', v)}
            placeholder="ej: Cambio de aceite" />

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Establecimiento *</label>
            <select value={form.establecimiento} onChange={e => f('establecimiento', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Seleccionar —</option>
              {establecimientos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo de servicio *</label>
            <select value={form.tipo_servicio} onChange={e => f('tipo_servicio', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Seleccionar —</option>
              {tiposServicio.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors flex items-center gap-2">
            {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Servicios() {
  const [servicios, setServicios]           = useState([])
  const [establecimientos, setEstabs]       = useState([])
  const [tiposServicio, setTiposServicio]   = useState([])
  const [loading, setLoading]               = useState(true)
  const [modal, setModal]                   = useState(false)
  const [editing, setEditing]               = useState(null)
  const [deleteId, setDeleteId]             = useState(null)
  const [filtroEstab, setFiltroEstab]       = useState('todos')
  const [busqueda, setBusqueda]             = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [s, e, t] = await Promise.all([
        api.get('/empresa/servicios/'),
        api.get('/empresa/mis-establecimientos/'),
        api.get('/tipos-servicio/'),
      ])
      setServicios(Array.isArray(s.data) ? s.data : s.data.results ?? [])
      setEstabs(Array.isArray(e.data) ? e.data : e.data.results ?? [])
      setTiposServicio(Array.isArray(t.data) ? t.data : t.data.results ?? [])
    } catch {}
    setLoading(false)
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/empresa/servicios/${id}/`)
      setDeleteId(null); fetchAll()
    } catch {}
  }

  const filtrados = servicios.filter(s => {
    const pasaEstab = filtroEstab === 'todos' || String(s.establecimiento_id) === filtroEstab
    const pasaBusq  = !busqueda || s.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return pasaEstab && pasaBusq
  })

  // Agrupar por establecimiento
  const agrupados = filtrados.reduce((acc, s) => {
    const key = s.establecimiento_nombre
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Servicios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{servicios.length} servicios registrados</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true) }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo servicio
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar servicio..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {establecimientos.length > 1 && (
          <select value={filtroEstab} onChange={e => setFiltroEstab(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="todos">Todos los establecimientos</option>
            {establecimientos.map(e => <option key={e.id} value={String(e.id)}>{e.nombre}</option>)}
          </select>
        )}
      </div>

      {/* Lista agrupada */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <span className="text-4xl">🔧</span>
          <p className="text-gray-400 text-sm">No hay servicios registrados</p>
          <button onClick={() => { setEditing(null); setModal(true) }}
            className="text-blue-600 text-sm hover:underline">Agregar el primero</button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(agrupados).map(([nombreEstab, items]) => (
            <div key={nombreEstab}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">{nombreEstab}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium">
                  {items.length} servicio{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(s => (
                  <div key={s.id}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{s.nombre}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.tipo_servicio_nombre}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setEditing(s); setModal(true) }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteId(s.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-500 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal editing={editing} establecimientos={establecimientos}
          tiposServicio={tiposServicio} onClose={() => setModal(false)} onGuardado={fetchAll} />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Eliminar servicio</h3>
            <p className="text-sm text-gray-500 mb-5">Esta accion no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}