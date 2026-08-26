import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import GoogleLoginButton from '../components/GoogleLoginButton'
import SelectorRolGoogle from '../components/SelectorRolGoogle'
import logo from '../assets/logo_solo.png'

function redirigirPorRol(navigate, rolNombre) {
  if (rolNombre === 'admin') {
    navigate('/admin/dashboard')
  } else if (rolNombre === 'empresa') {
    navigate('/empresa/dashboard')
  } else {
    navigate('/inicio')
  }
}

const ROLES_PUBLICOS = [
  { label: 'Cliente',  descripcion: 'Busco talleres y agendo citas' },
  { label: 'Empresa',  descripcion: 'Tengo un taller y ofrezco servicios' },
]

const EMPTY_FORM = {
  username:   '',
  first_name: '',
  last_name:  '',
  email:      '',
  telefono:   '',
  password:   '',
  password2:  '',
  rol_label:  'Cliente',
}

export default function Register() {
  const { dark, setDark } = useTheme()
  const navigate          = useNavigate()
  const { login, loginWithGoogle } = useAuth()

  const [form, setForm]     = useState(EMPTY_FORM)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [pendienteGoogle, setPendienteGoogle] = useState(null)
  const [creandoCuenta, setCreandoCuenta]     = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit() {
    setError('')

    if (!form.username || !form.email || !form.password || !form.password2) {
      setError('Completa todos los campos obligatorios')
      return
    }
    if (form.password !== form.password2) {
      setError('Las contrasenas no coinciden')
      return
    }
    if (form.password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
  const rolesRes = await api.get('/roles/')
  const rol = rolesRes.data.find(
    r => r.nombre.toLowerCase() === form.rol_label.toLowerCase()
  )

  if (!rol) {
    setError('No se pudo obtener el rol. Contacta al administrador.')
    setLoading(false)
    return
  }

  const res = await api.post('/usuarios/register/', {
  username:   form.username,
  first_name: form.first_name,
  last_name:  form.last_name,
  email:      form.email,
  telefono:   form.telefono,
  password:   form.password,
  rol:        rol.id,
})

const perfilData = await login(form.username, form.password)
redirigirPorRol(navigate, perfilData?.rol_nombre?.toLowerCase())

} catch (err) {
  const data = err.response?.data
  if (data?.username) {
    setError('Ese nombre de usuario ya existe')
  } else if (data?.email) {
    setError('Ese correo ya esta registrado')
  } else {
    setError('Ocurrio un error al registrarse. Intenta de nuevo.')
  }

    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleCredential(credential) {
    setError('')
    try {
      const resultado = await loginWithGoogle(credential)
      if (resultado?.requiereRol) {
        setPendienteGoogle({ credential, ...resultado })
        return
      }
      redirigirPorRol(navigate, resultado.rol_nombre?.toLowerCase())
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo continuar con Google')
    }
  }

  async function handleConfirmarRol(rol) {
    if (!rol || !pendienteGoogle) return
    setCreandoCuenta(true)
    setError('')
    try {
      const user = await loginWithGoogle(pendienteGoogle.credential, rol)
      setPendienteGoogle(null)
      redirigirPorRol(navigate, user.rol_nombre?.toLowerCase())
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo crear la cuenta')
      setCreandoCuenta(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-10">

      {/* Toggle tema */}
      <button
        onClick={() => setDark(!dark)}
        className="fixed top-4 right-4 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm"
      >
        {dark ? 'Modo claro' : 'Modo oscuro'}
      </button>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="Tu Taller a un Clic"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Crear cuenta</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registrate en Tu Taller a un Clic</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-6 py-6">

          {/* Selector de rol */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {ROLES_PUBLICOS.map(r => (
              <button
                key={r.label}
                onClick={() => setForm(f => ({ ...f, rol_label: r.label }))}
                className={`flex flex-col items-start px-4 py-3 rounded-lg border text-left transition-colors ${
                  form.rol_label === r.label
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className={`text-sm font-semibold mb-0.5 ${
                  form.rol_label === r.label
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {r.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {r.descripcion}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">

            {/* Nombre y apellido */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre" value={form.first_name} onChange={set('first_name')} onKeyDown={handleKey} />
              <Field label="Apellido" value={form.last_name} onChange={set('last_name')} onKeyDown={handleKey} />
            </div>

            <Field label="Usuario *" value={form.username} onChange={set('username')} onKeyDown={handleKey} />
            <Field label="Correo electronico *" type="email" value={form.email} onChange={set('email')} onKeyDown={handleKey} />
            <Field label="Telefono" value={form.telefono} onChange={set('telefono')} onKeyDown={handleKey} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Contrasena *" type="password" value={form.password} onChange={set('password')} onKeyDown={handleKey} />
              <Field label="Confirmar *" type="password" value={form.password2} onChange={set('password2')} onKeyDown={handleKey} />
            </div>

            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {loading && (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500">o continúa con</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <GoogleLoginButton
              dark={dark}
              onCredential={handleGoogleCredential}
              onError={() => setError('No se pudo cargar Google Sign-In')}
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Inicia sesion
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-3">
          Tu Taller a un Clic &copy; 2025
        </p>
      </div>

      {pendienteGoogle && (
        <SelectorRolGoogle
          datos={pendienteGoogle}
          loading={creandoCuenta}
          onConfirmar={handleConfirmarRol}
          onCancelar={() => setPendienteGoogle(null)}
        />
      )}
    </div>
  )
}

function Field({ label, value, onChange, onKeyDown, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      />
    </div>
  )
}