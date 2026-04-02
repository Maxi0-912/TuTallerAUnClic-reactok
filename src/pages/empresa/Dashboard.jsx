import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../services/api'

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'text-blue-600 dark:text-blue-400',
    green:  'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red:    'text-red-600 dark:text-red-400',
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

const ESTADO_COLOR = {
  pendiente:  '#f59e0b',
  confirmada: '#3b82f6',
  finalizada: '#10b981',
  cancelada:  '#6b7280',
}

export default function EmpresaDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/empresa/dashboard/')
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  )

  if (!data) return (
    <p className="text-gray-400 text-sm">Error al cargar el dashboard.</p>
  )

  const { resumen_general: rg, por_establecimiento: pe } = data

  // Datos para gráfica comparativa
  const datosComparativa = pe.map(e => ({
    name: e.nombre.length > 12 ? e.nombre.slice(0, 12) + '…' : e.nombre,
    citas: e.total_citas_mes,
    calificacion: e.calificacion ?? 0,
  }))

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Resumen de tu actividad este mes</p>
      </div>

      {/* Tarjetas generales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Establecimientos"  value={rg.total_establecimientos} color="blue" />
        <StatCard label="Citas este mes"    value={rg.total_citas_mes}        color="green" />
        <StatCard label="Pendientes hoy"    value={rg.pendientes_hoy}         color="yellow" />
        <StatCard label="Calificacion prom" value={rg.calificacion_promedio ? `${rg.calificacion_promedio} ★` : '—'} color="yellow" />
      </div>

      {/* Comparativa entre establecimientos */}
      {pe.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Citas por establecimiento este mes</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={datosComparativa}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '12px' }}
              />
              <Bar dataKey="citas" fill="#3b82f6" radius={[4,4,0,0]} name="Citas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cards por establecimiento */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Por establecimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pe.map(e => (
            <div key={e.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                  {e.foto_url
                    ? <img src={e.foto_url} alt={e.nombre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">{e.tipo === 'Taller' ? '🔧' : '💧'}</div>
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{e.nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{e.tipo}</p>
                </div>
                <div className="ml-auto text-right">
                  {e.calificacion && (
                    <p className="text-sm font-bold text-yellow-500">{e.calificacion} ★</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{e.total_citas_mes}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Citas este mes</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{e.pendientes_hoy}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pendientes hoy</p>
                </div>
              </div>

              {/* Estados */}
              {e.citas_por_estado.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {e.citas_por_estado.map(s => (
                    <span key={s.estado}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${ESTADO_COLOR[s.estado]}20`,
                        color: ESTADO_COLOR[s.estado],
                        border: `1px solid ${ESTADO_COLOR[s.estado]}40`,
                      }}>
                      {s.estado}: {s.total}
                    </span>
                  ))}
                </div>
              )}

              <Link to="/empresa/citas"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                Ver citas
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Acceso rapido si no hay establecimientos */}
      {pe.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          {/* <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <span className="text-3xl">🔧</span>
          </div> */}
          <div className="text-center">
            <p className="font-semibold text-gray-800 dark:text-gray-100">Aun no tienes establecimientos</p>
            <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Registra tu taller o lavadero para empezar</p>
          </div>
          <Link to="/empresa/establecimientos"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            Registrar establecimiento
          </Link>
        </div>
      )}
    </div>
  )
}