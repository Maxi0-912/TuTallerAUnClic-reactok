import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const EMPTY = {
  nombre: '', direccion: '', telefono: '', descripcion: '',
  hora_apertura: '08:00', hora_cierre: '18:00',
  latitud: '', longitud: '', tipo: '', foto: null, foto_preview: null,
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}

function MapPicker({ lat, lng, onChange }) {
  const center = lat && lng ? [parseFloat(lat), parseFloat(lng)] : [2.4419, -76.6063]

  function ClickHandler() {
    useMapEvents({
      click(e) { onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6)) }
    })
    return null
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600" style={{ height: 220 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        {lat && lng && <Marker position={[parseFloat(lat), parseFloat(lng)]} />}
      </MapContainer>
    </div>
  )
}

function ModalEstablecimiento({ editing, tipos, onClose, onGuardado }) {
  const [form, setForm]   = useState(editing ? {
    ...editing,
    tipo: editing.tipo ?? '',
    foto: null,
    foto_preview: editing.foto_url ?? null,
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const fileRef             = useRef(null)

  function f(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave() {
    if (!form.nombre || !form.tipo || !form.latitud || !form.longitud) {
      setError('Nombre, tipo y ubicacion son obligatorios'); return
    }
    setSaving(true); setError('')
    try {
      const payload = new FormData()
      const campos = ['nombre','direccion','telefono','descripcion',
                      'hora_apertura','hora_cierre','latitud','longitud','tipo']
      campos.forEach(k => { if (form[k] !== '' && form[k] !== null) payload.append(k, form[k]) })
      if (form.foto) payload.append('foto', form.foto)

      if (editing) {
        await api.patch(`/empresa/mis-establecimientos/${editing.id}/`, payload,
          { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/empresa/mis-establecimientos/crear/', payload,
          { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      onGuardado()
      onClose()
    } catch { setError('Error al guardar') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {editing ? 'Editar establecimiento' : 'Nuevo establecimiento'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {/* Foto */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Foto principal</label>
            <div onClick={() => fileRef.current?.click()}
              className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 cursor-pointer overflow-hidden transition-colors group">
              {form.foto_preview ? (
                <>
                  <img src={form.foto_preview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Cambiar foto</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                  </svg>
                  <span className="text-xs">Click para subir foto</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const file = e.target.files[0]
                if (!file) return
                f('foto', file)
                f('foto_preview', URL.createObjectURL(file))
              }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *" value={form.nombre} onChange={v => f('nombre', v)} />
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo *</label>
              <select value={String(form.tipo)} onChange={e => f('tipo', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Seleccionar —</option>
                {tipos.map(t => <option key={t.id} value={String(t.id)}>{t.nombre}</option>)}
              </select>
            </div>
          </div>

          <Field label="Direccion" value={form.direccion} onChange={v => f('direccion', v)} />
          <Field label="Telefono"  value={form.telefono}  onChange={v => f('telefono', v)} />

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descripcion</label>
            <textarea value={form.descripcion} onChange={e => f('descripcion', e.target.value)} rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Hora apertura" type="time" value={form.hora_apertura} onChange={v => f('hora_apertura', v)} />
            <Field label="Hora cierre"   type="time" value={form.hora_cierre}   onChange={v => f('hora_cierre', v)} />
          </div>

          {/* Mapa */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Ubicacion * — haz clic en el mapa para marcar
            </label>
            <MapPicker
              lat={form.latitud} lng={form.longitud}
              onChange={(lat, lng) => { f('latitud', lat); f('longitud', lng) }}
            />
            {form.latitud && form.longitud && (
              <p className="text-xs text-blue-500 mt-1">{form.latitud}, {form.longitud}</p>
            )}
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
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear establecimiento'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CardEstablecimiento({ e, onEdit, onDelete }) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
        {e.foto_url
          ? <img src={e.foto_url} alt={e.nombre} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">
              {e.tipo_nombre?.toLowerCase() === 'taller' ? '🔧' : '💧'}
            </div>
        }
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/90 text-white backdrop-blur-sm">
          {e.tipo_nombre}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">{e.nombre}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {e.direccion}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🕐 {e.hora_apertura?.slice(0,5)} – {e.hora_cierre?.slice(0,5)}
        </p>
        {e.promedio_calificacion && (
          <p className="text-xs text-yellow-500 font-medium">★ {e.promedio_calificacion}</p>
        )}
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <button onClick={() => onEdit(e)}
          className="flex-1 py-2 rounded-xl border border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-medium transition-colors">
          Editar
        </button>
        <button onClick={() => onDelete(e.id)}
          className="flex-1 py-2 rounded-xl border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 text-xs font-medium transition-colors">
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default function MisEstablecimientos() {
  const [establecimientos, setEstablecimientos] = useState([])
  const [tipos, setTipos]                       = useState([])
  const [loading, setLoading]                   = useState(true)
  const [modal, setModal]                       = useState(false)
  const [editing, setEditing]                   = useState(null)
  const [deleteId, setDeleteId]                 = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [e, t] = await Promise.all([
        api.get('/empresa/mis-establecimientos/'),
        api.get('/tipos-establecimiento/'),
      ])
      setEstablecimientos(Array.isArray(e.data) ? e.data : e.data.results ?? [])
      setTipos(Array.isArray(t.data) ? t.data : t.data.results ?? [])
    } catch {}
    setLoading(false)
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/empresa/mis-establecimientos/${id}/`)
      setDeleteId(null)
      fetchAll()
    } catch {}
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Mis establecimientos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestiona tus talleres y lavaderos</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true) }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo establecimiento
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : establecimientos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <span className="text-5xl">🔧</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No tienes establecimientos registrados</p>
          <button onClick={() => { setEditing(null); setModal(true) }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            Registrar mi primer establecimiento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {establecimientos.map(e => (
            <CardEstablecimiento key={e.id} e={e}
              onEdit={est => { setEditing(est); setModal(true) }}
              onDelete={id => setDeleteId(id)} />
          ))}
        </div>
      )}

      {modal && (
        <ModalEstablecimiento
          editing={editing}
          tipos={tipos}
          onClose={() => setModal(false)}
          onGuardado={fetchAll}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Eliminar establecimiento</h3>
            <p className="text-sm text-gray-500 mb-5">Se eliminaran todas las citas y servicios asociados. Esta accion no se puede deshacer.</p>
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