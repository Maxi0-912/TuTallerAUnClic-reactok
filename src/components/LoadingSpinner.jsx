const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
}

const COLORS = {
  white: 'border-white border-t-transparent',
  blue: 'border-gray-300 dark:border-gray-600 border-t-blue-600',
}

export default function LoadingSpinner({ size = 'md', color = 'blue', className = '' }) {
  return (
    <span
      className={`inline-block rounded-full animate-spin ${SIZES[size]} ${COLORS[color]} ${className}`}
    />
  )
}
