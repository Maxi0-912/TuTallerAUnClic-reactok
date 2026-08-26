import { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

const OPCIONES = [
  { rol: 2, label: 'Soy Cliente', desc: 'Busco talleres y lavaderos, agendo citas y califico servicios' },
  { rol: 3, label: 'Soy Empresa', desc: 'Tengo un taller o lavadero y quiero recibir clientes' },
]

export default function SelectorRolGoogle({ datos, onConfirmar, onCancelar, loading }) {
  const [rolSel, setRolSel] = useState(null)
  const nombre = datos?.nombre || datos?.email || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && onCancelar()} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">

        <div className="text-center mb-6">
          {datos?.foto && (
            <img src={datos.foto} alt="" className="w-14 h-14 rounded-full mx-auto mb-3 border border-gray-200 dark:border-gray-700" />
          )}
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {nombre ? `Hola, ${nombre}` : 'Un paso mas'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Contanos como vas a usar Tu Taller a un Clic
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {OPCIONES.map(op => (
            <button key={op.rol} type="button"
              onClick={() => setRolSel(op.rol)}
              disabled={loading}
              className={`flex flex-col items-start text-left px-4 py-4 rounded-xl border transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 ${
                rolSel === op.rol
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-500/40'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className={`text-sm font-semibold mb-1 ${
                rolSel === op.rol ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'
              }`}>
                {op.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                {op.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onCancelar} disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={() => onConfirmar(rolSel)} disabled={!rolSel || loading}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2">
            {loading && <LoadingSpinner size="sm" color="white" />}
            {loading ? 'Creando cuenta...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}
