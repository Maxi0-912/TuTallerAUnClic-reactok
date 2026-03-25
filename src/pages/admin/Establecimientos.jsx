import { useState } from 'react'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { adminService } from '../../services/adminService'
import { useAdminData } from '../../hooks/useAdminData'
import MapPicker from '../../components/MapPicker'

const EMPTY_FORM = {
  nombre: '', direccion: '', telefono: '',
  hora_apertura: '08:00', hora_cierre: '18:00',
  descripcion: '', latitud: '', longitud: '',
  tipo: '', propietario: '',
  foto: null,
}

export default function Establecimientos() {
  const { data: establecimientos, setData: setEstablecimientos, loading, error, reload } = useAdminData(adminService.getEstablecimientos)
  const { data: tipos } = useAdminData(adminService.getTiposEstablecimiento)
  const { data: usuarios } = useAdminData(adminService.getUsuarios)

  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]   = useState(null)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')

  const filtered = establecimientos.filter(e =>
    `${e.nombre} ${e.direccion} ${e.tipo} ${e.propietario}`
      .toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(e) {
    setEditTarget(e)
    setForm({
      nombre: e.nombre, direccion: e.direccion,
      telefono: e.telefono, hora_apertura: e.hora_apertura,
      hora_cierre: e.hora_cierre, descripcion: e.descripcion,
      latitud: e.latitud, longitud: e.longitud,
      tipo: e.tipo, propietario: e.propietario,
      foto: e.foto || null,
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre || !form.direccion) {
      setFormError('Nombre y direccion son obligatorios')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await adminService.updateEstablecimiento(editTarget.id, form)
      } else {
        await adminService.createEstablecimiento(form)
      }
      await reload()
      setShowModal(false)
    } catch {
      setFormError('Error al guardar. Verifica los datos.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await adminService.deleteEstablecimiento(confirmId)
      setEstablecimientos(prev => prev.filter(e => e.id !== confirmId))
    } catch {
      alert('Error al eliminar')
    } finally {
      setConfirmId(null)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorMsg msg={error} onRetry={reload} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Establecimientos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestion de talleres y centros de servicio</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          Nuevo establecimiento
        </button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Buscar por nombre, tipo o propietario..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Direccion</th>
              <th className="px-4 py-3 text-left">Telefono</th>
              <th className="px-4 py-3 text-left">Horario</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Propietario</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No se encontraron establecimientos</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{e.nombre}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{e.direccion}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{e.telefono}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{e.hora_apertura} - {e.hora_cierre}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    {e.tipo_nombre ?? e.tipo ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{e.propietario_username ?? e.propietario ?? '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="px-3 py-1 text-xs rounded border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">Editar</button>
                    <button onClick={() => setConfirmId(e.id)} className="px-3 py-1 text-xs rounded border border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{filtered.length} establecimiento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>

      {showModal && (
        <Modal title={editTarget ? 'Editar establecimiento' : 'Nuevo establecimiento'} onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
            <Field label="Nombre" value={form.nombre} onChange={v => setForm(f => ({ ...f, nombre: v }))} />
            <Field label="Direccion" value={form.direccion} onChange={v => setForm(f => ({ ...f, direccion: v }))} />
            <Field label="Telefono" value={form.telefono} onChange={v => setForm(f => ({ ...f, telefono: v }))} />
            <Field label="Descripcion" value={form.descripcion} onChange={v => setForm(f => ({ ...f, descripcion: v }))} />
              {/* Foto principal */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Foto principal
              </label>
              <div
                onClick={() => document.getElementById('input-foto-estab').click()}
                className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer overflow-hidden transition-colors group"
              >
                {form.foto_preview ? (
                  <>
                    <img src={form.foto_preview} alt="preview"
                      className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Cambiar foto</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                    </svg>
                    <span className="text-xs">Click para subir foto</span>
                  </div>
                )}
              </div>
              <input id="input-foto-estab" type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  setForm(f => ({
                    ...f,
                    foto: file,
                    foto_preview: URL.createObjectURL(file)
                  }))
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hora apertura" type="time" value={form.hora_apertura} onChange={v => setForm(f => ({ ...f, hora_apertura: v }))} />
              <Field label="Hora cierre" type="time" value={form.hora_cierre} onChange={v => setForm(f => ({ ...f, hora_cierre: v }))} />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Ubicacion en el mapa
                </label>
                <MapPicker
                  lat={form.latitud}
                  lng={form.longitud}
                  onChange={(lat, lng) => setForm(f => ({ ...f, latitud: lat.toFixed(6), longitud: lng.toFixed(6) }))}
                />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo de establecimiento</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar tipo</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Propietario</label>
              <select value={form.propietario} onChange={e => setForm(f => ({ ...f, propietario: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar propietario</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
            {formError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors flex items-center gap-2">
                {saving && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {editTarget ? 'Guardar cambios' : 'Crear establecimiento'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmId && <ConfirmDialog message="Esta accion eliminara el establecimiento permanentemente. Deseas continuar?" onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}

function LoadingSpinner() {
  return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /></div>
}

function ErrorMsg({ msg, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-sm text-red-500">{msg}</p>
      <button onClick={onRetry} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Reintentar</button>
    </div>
  )
}