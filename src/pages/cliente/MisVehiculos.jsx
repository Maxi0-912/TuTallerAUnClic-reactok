import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function MisVehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [placa, setPlaca]         = useState('')
  const [adding, setAdding]       = useState(false)
  const [error, setError]         = useState('')
  const [deleteId, setDeleteId]   = useState(null)

  useEffect(() => { fetchVehiculos() }, [])

  async function fetchVehiculos() {
    try {
      const res = await api.get('/usuarios/mis-vehiculos/')
      setVehiculos(Array.isArray(res.data) ? res.data : res.data.results ?? [])
    } catch {}
    setLoading(false)
  }

  async function handleAgregar() {
    if (!placa.trim()) { setError('Ingresa una placa'); return }
    if (placa.trim().length < 5) { setError('Placa invalida'); return }
    setAdding(true); setError('')
    try {
      await api.post('/usuarios/mis-vehiculos/crear/', {
        placa: placa.trim().toUpperCase()
      })
      setPlaca('')
      fetchVehiculos()
    } catch (err) {
      setError(err.response?.data?.placa?.[0] ?? 'Error al agregar vehiculo')
    }
    setAdding(false)
  }

  async function handleEliminar(placa) {
    try {
      await api.delete(`/usuarios/mis-vehiculos/${placa}/`)
      setDeleteId(null)
      fetchVehiculos()
    } catch {}
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-900/50 dark:bg-gray-950/50">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <div>
          <h1 className="text-3xl font-black text-white">Mis vehiculos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona los vehiculos registrados en tu cuenta</p>
        </div>

        {/* Agregar vehiculo */}
        <div className="bg-slate-800/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-slate-700 dark:border-gray-700 p-5">
          <h2 className="text-sm font-bold text-white mb-4">Agregar vehiculo</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                value={placa}
                onChange={e => setPlaca(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                placeholder="ej: ABC123"
                maxLength={8}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-700 dark:bg-gray-800 border border-slate-600 dark:border-gray-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest font-mono"
              />
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>
            <button onClick={handleAgregar} disabled={adding}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center gap-2 shrink-0">
              {adding
                ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
              }
              Agregar
            </button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : vehiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="text-slate-400 text-sm">No tienes vehiculos registrados</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {vehiculos.map(v => (
              <div key={v.placa}
                className="bg-slate-800/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-slate-700 dark:border-gray-700 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-black text-white text-lg tracking-widest font-mono">{v.placa}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Vehiculo registrado</p>
                </div>
                <button onClick={() => setDeleteId(v.placa)}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-slate-800 dark:bg-gray-900 rounded-xl shadow-xl border border-slate-700 p-6">
            <h3 className="text-base font-bold text-white mb-2">Eliminar vehiculo</h3>
            <p className="text-sm text-slate-400 mb-5">
              ¿Eliminar el vehiculo <span className="font-mono font-bold text-white">{deleteId}</span>?
              El historial de citas se mantendra.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleEliminar(deleteId)}
                className="px-4 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}