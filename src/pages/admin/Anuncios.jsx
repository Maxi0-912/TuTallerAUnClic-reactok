import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

const TIPOS = [
  { value: 'imagen',       label: 'Solo imagen' },
  { value: 'imagen_texto', label: 'Imagen con texto' },
  { value: 'imagen_boton', label: 'Imagen con boton' },
]

const CATEGORIAS = [
  { value: 'banner', label: 'Banner' },
  { value: 'oferta',  label: 'Oferta' },
]

const EMPTY = {
  titulo: '', descripcion: '', tipo: 'imagen',
  categoria: 'banner', descuento: '',
  texto_boton: '', url_boton: '', establecimiento: '',
  activo: true, orden: 0, fecha_inicio: '', fecha_fin: '',
}

export default function Anuncios() {
  const [anuncios, setAnuncios]         = useState([])
  const [establecimientos, setEstabs]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(false)
  const [editing, setEditing]           = useState(null)
  const [form, setForm]                 = useState(EMPTY)
  const [imagenFile, setImagenFile]     = useState(null)
  const [preview, setPreview]           = useState(null)
  const [saving, setSaving]             = useState(false)
  const [deleteId, setDeleteId]         = useState(null)
  const [error, setError]               = useState('')
  const fileRef                         = useRef(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [a, e] = await Promise.all([
        api.get('/api/admin/anuncios/'),
        api.get('/establecimientos/'),
      ])
      setAnuncios(Array.isArray(a.data) ? a.data : a.data.results ?? [])
      setEstabs(Array.isArray(e.data) ? e.data : e.data.results ?? [])
    } catch { }
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setImagenFile(null)
    setPreview(null)
    setError('')
    setModal(true)
  }

  function openEdit(a) {
    setEditing(a)
    setForm({
      titulo:          a.titulo         ?? '',
      descripcion:     a.descripcion    ?? '',
      tipo:            a.tipo           ?? 'imagen',
      categoria:       a.categoria      ?? 'banner',
      descuento:       a.descuento      ?? '',
      texto_boton:     a.texto_boton    ?? '',
      url_boton:       a.url_boton      ?? '',
      establecimiento: a.establecimiento ?? '',
      activo:          a.activo         ?? true,
      orden:           a.orden          ?? 0,
      fecha_inicio:    a.fecha_inicio   ?? '',
      fecha_fin:       a.fecha_fin      ?? '',
    })
    setImagenFile(null)
    setPreview(a.imagen_url ?? null)
    setError('')
    setModal(true)
  }

  function handleImagen(e) {
    const file = e.target.files[0]
    if (!file) return
    setImagenFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setError('')
    if (!imagenFile && !editing) { setError('La imagen es obligatoria'); return }

    setSaving(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) payload.append(k, v)
      })
      if (imagenFile) payload.append('imagen', imagenFile)

      if (editing) {
        await api.patch(`/api/admin/anuncios/${editing.id}/`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/api/admin/anuncios/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setModal(false)
      fetchAll()
    } catch (e) {
      setError('Error al guardar el anuncio')
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/admin/anuncios/${id}/`)
      setDeleteId(null)
      fetchAll()
    } catch { }
  }

  function f(k, v) { setForm(p => ({ ...p, [k]: v })) }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Anuncios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestiona el carrusel del home</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo anuncio
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : anuncios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-gray-400 text-sm">No hay anuncios creados</p>
            <button onClick={openCreate} className="text-blue-600 text-sm hover:underline">Crear el primero</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left">Imagen</th>
                  <th className="px-4 py-3 text-left">Titulo</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Establecimiento</th>
                  <th className="px-4 py-3 text-left">Orden</th>
                  <th className="px-4 py-3 text-left">Vigencia</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {anuncios.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      {a.imagen_url ? (
                        <img src={a.imagen_url} alt={a.titulo}
                          className="w-16 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-16 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{a.titulo || <span className="text-gray-400 italic">Sin titulo</span>}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium">
                        {TIPOS.find(t => t.value === a.tipo)?.label ?? a.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.establecimiento_nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.orden}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {a.fecha_inicio || a.fecha_fin
                        ? `${a.fecha_inicio ?? '∞'} → ${a.fecha_fin ?? '∞'}`
                        : <span className="text-gray-400">Sin limite</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.activo
                        ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                        {a.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(a)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteId(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-500 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                {editing ? 'Editar anuncio' : 'Nuevo anuncio'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">

              {/* Preview imagen */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Imagen del anuncio *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer overflow-hidden transition-colors group"
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Cambiar imagen</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                      </svg>
                      <span className="text-xs text-gray-400">Click para subir imagen</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">JPG, PNG, WEBP recomendado 1920x600</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
              </div>

              {/* Tipo y categoria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo de anuncio</label>
                  <select value={form.tipo} onChange={e => f('tipo', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
                  <select value={form.categoria} onChange={e => f('categoria', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Descuento — solo si la categoria es oferta */}
              {form.categoria === 'oferta' && (
                <Field label="Descuento" value={form.descuento} onChange={v => f('descuento', v)} placeholder="ej: 20% OFF" />
              )}

              {/* Titulo y descripcion — solo si no es solo imagen */}
              {form.tipo !== 'imagen' && (
                <>
                  <Field label="Titulo" value={form.titulo} onChange={v => f('titulo', v)} />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descripcion</label>
                    <textarea value={form.descripcion} onChange={e => f('descripcion', e.target.value)} rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </>
              )}

              {/* Boton — solo si es imagen_boton */}
              {form.tipo === 'imagen_boton' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Texto del boton" value={form.texto_boton} onChange={v => f('texto_boton', v)} placeholder="Ver más" />
                  <Field label="URL del boton" value={form.url_boton} onChange={v => f('url_boton', v)} placeholder="/establecimientos/5" />
                </div>
              )}

              {/* Establecimiento */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Establecimiento (opcional)</label>
                <select value={form.establecimiento} onChange={e => f('establecimiento', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Ninguno —</option>
                  {establecimientos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>

              {/* Orden + fechas */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Orden" type="number" value={form.orden} onChange={v => f('orden', v)} />
                <Field label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={v => f('fecha_inicio', v)} />
                <Field label="Fecha fin"    type="date" value={form.fecha_fin}    onChange={v => f('fecha_fin', v)} />
              </div>

              {/* Activo */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => f('activo', !form.activo)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none ${form.activo ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  style={{ minWidth: '2.5rem', height: '1.4rem' }}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.activo ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {form.activo ? 'Anuncio activo (visible en el home)' : 'Anuncio inactivo (oculto)'}
                </span>
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors flex items-center gap-2">
                {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear anuncio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Eliminar anuncio</h3>
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

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}