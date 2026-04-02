import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Perfil() {
  const { user, setUser } = useAuth()

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
    email:      user?.email      ?? '',
    telefono:   user?.telefono   ?? '',
    password:   '',
    password2:  '',
  })

  const [preview, setPreview]   = useState(user?.foto_url ?? null)
  const [fotoFile, setFotoFile] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')
  const fileRef                 = useRef(null)

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setFotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function removeFoto() {
    setFotoFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSave() {
    setError(''); setSuccess('')
    if (form.password && form.password !== form.password2) {
      setError('Las contrasenas no coinciden'); return
    }
    if (form.password && form.password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres'); return
    }
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('first_name', form.first_name)
      payload.append('last_name',  form.last_name)
      payload.append('email',      form.email)
      payload.append('telefono',   form.telefono)
      if (form.password) payload.append('password', form.password)
      if (fotoFile)      payload.append('foto', fotoFile)
      if (!preview && !fotoFile) payload.append('foto', '')

      const res = await api.patch('/usuarios/perfil/update/', payload,
        { headers: { 'Content-Type': 'multipart/form-data' } })

      setUser(prev => ({ ...prev, ...res.data }))
      setSuccess('Perfil actualizado correctamente')
      setForm(f => ({ ...f, password: '', password2: '' }))
      setFotoFile(null)
    } catch { setError('Error al guardar los cambios') }
    setSaving(false)
  }

  const inicial = user?.username?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Mi perfil</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Actualiza tu informacion personal</p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-6">

        {/* Foto */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {preview ? (
              <img src={preview} alt="Foto de perfil"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                <span className="text-white text-2xl font-bold">{inicial}</span>
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white dark:border-gray-900 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user?.username}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user?.rol_nombre}</p>
            <div className="flex gap-2 mt-1">
              <button onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cambiar foto
              </button>
              {preview && (
                <button onClick={removeFoto}
                  className="px-3 py-1.5 text-xs rounded-md border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  Quitar foto
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre"   value={form.first_name} onChange={v => setForm(f => ({ ...f, first_name: v }))} />
          <Field label="Apellido" value={form.last_name}  onChange={v => setForm(f => ({ ...f, last_name: v }))} />
        </div>
        <Field label="Correo electronico" type="email" value={form.email}    onChange={v => setForm(f => ({ ...f, email: v }))} />
        <Field label="Telefono"           value={form.telefono}              onChange={v => setForm(f => ({ ...f, telefono: v }))} />

        <div className="border-t border-gray-100 dark:border-gray-800" />

        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Cambiar contrasena</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nueva contrasena"     type="password" value={form.password}  onChange={v => setForm(f => ({ ...f, password: v }))} />
            <Field label="Confirmar contrasena" type="password" value={form.password2} onChange={v => setForm(f => ({ ...f, password2: v }))} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Deja en blanco para no cambiar la contrasena</p>
        </div>

        {error   && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-xs text-green-600 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">{success}</p>}

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors flex items-center gap-2">
            {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}