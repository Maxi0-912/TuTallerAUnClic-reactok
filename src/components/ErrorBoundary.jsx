import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900 shadow-sm px-6 py-6 text-center">
            <h1 className="text-lg font-semibold text-red-600 dark:text-red-400">Algo salio mal</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {this.state.error?.message ?? 'Ocurrio un error inesperado.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
