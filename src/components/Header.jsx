import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV_LINKS = [
  { to: '/inicio',           label: 'Inicio' },
  { to: '/establecimientos', label: 'Talleres y Lavaderos' },
  { to: '/mapa',             label: 'Mapa' },
  { to: '/mis-citas',        label: 'Mis citas' },
]

export default function Header() {
  const { user, logout }    = useAuth()
  const { dark, setDark }   = useTheme()
  const navigate            = useNavigate()
  const [scrolled, setScrolled]   = useState(false)
  const [userMenu, setUserMenu]   = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const inicial = user?.username?.[0]?.toUpperCase() ?? 'U'

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
          ${scrolled
            ? 'bg-blue-950/75 dark:bg-blue-950/80 backdrop-blur-md shadow-lg'
            : 'bg-blue-800/55 dark:bg-blue-950/60 backdrop-blur-sm'
          }`}
        >
          {/* Efecto rayo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="lightning-ray" />
        </div>     
         
          <div className="max-w-screen-3xl mx-auto px-6 sm:px-10 lg:px-16 z-10">
            <div className="flex items-center h-16">

            {/* Logo */}
            <div className="flex-none">
              <Link to="/inicio" className="flex items-center gap-2.5">
                <img src="/logo_solo.png" alt="Tu Taller a un Clic" className="w-8 h-8 object-contain" />
                <span className="text-white font-bold text-sm tracking-wide hidden sm:block">Tu Taller a un Clic</span>
              </Link>
            </div>

            {/* Nav centrado — desktop */}
            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-sm rounded-lg transition-all duration-200 font-medium
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Derecha: tema + usuario */}
            <div className="flex-none ml-auto flex items-center gap-3">

              {/* Toggle tema */}
              <button
                onClick={() => setDark(!dark)}
                className="relative w-10 h-5.5 rounded-full transition-colors duration-300 focus:outline-none bg-white/20 hover:bg-white/30"
                aria-label="Toggle dark mode"
                style={{ minWidth: '2.75rem', height: '1.5rem' }}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center text-xs
                  ${dark ? 'translate-x-5' : 'translate-x-0'}`}
                >
                  {dark ? '🌙' : '☀️'}
                </span>
              </button>

              {/* Usuario */}
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenu(v => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                      {user.foto_url ? (
                        <img src={user.foto_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">{inicial}</span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">{user.username}</span>
                    <svg className={`w-4 h-4 text-white/70 transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/mi-perfil" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          Editar perfil
                        </Link>
                        <Link to="/mis-vehiculos" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                          </svg>
                          Mis vehiculos
                        </Link>
                        <button onClick={() => { setUserMenu(false); handleLogout() }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                          </svg>
                          Cerrar sesion
                        </button>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                        <button onClick={() => { setUserMenu(false); setDeleteModal(true) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Eliminar cuenta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login"
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors">
                  Iniciar sesion
                </Link>
              )}

              {/* Hamburguesa mobile */}
              <button onClick={() => setMobileMenu(v => !v)}
                className="lg:hidden flex flex-col gap-1 p-2 rounded-md hover:bg-white/10 transition-colors">
                <span className="block h-0.5 w-5 bg-white rounded" />
                <span className={`block h-0.5 bg-white rounded transition-all ${mobileMenu ? 'w-3' : 'w-5'}`} />
                <span className="block h-0.5 w-5 bg-white rounded" />
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenu && (
          <div className="lg:hidden bg-blue-900/80 dark:bg-blue-950/90 backdrop-blur-md border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <NavLink key={link.to} to={link.to}
                  onClick={() => setMobileMenu(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 text-sm rounded-lg font-medium transition-colors
                    ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Modal eliminar cuenta */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Eliminar cuenta</h3>
                <p className="text-sm text-gray-500">Esta accion no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Se eliminaran permanentemente todos tus datos, historial de citas y configuraciones.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { setDeleteModal(false); alert('Cuenta eliminada') }}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}