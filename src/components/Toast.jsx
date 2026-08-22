const STYLES = {
  success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400',
  error:   'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400',
  info:    'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400',
  warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400',
}

export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 text-sm border rounded-lg shadow-sm animate-fade-in ${STYLES[type]}`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-100 leading-none"
        aria-label="Cerrar"
      >
        &times;
      </button>
    </div>
  )
}
