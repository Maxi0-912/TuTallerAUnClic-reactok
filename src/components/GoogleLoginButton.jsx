import { useEffect, useRef, useId } from 'react'

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function loadGisScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
  if (existing) {
    return new Promise(resolve => existing.addEventListener('load', resolve, { once: true }))
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'))
    document.head.appendChild(script)
  })
}

export default function GoogleLoginButton({ onCredential, onError, dark = false }) {
  const containerRef = useRef(null)
  const domId = useId()
  const onCredentialRef = useRef(onCredential)
  onCredentialRef.current = onCredential

  useEffect(() => {
    let cancelled = false

    loadGisScript()
      .then(() => {
        if (cancelled || !containerRef.current) return
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: response => onCredentialRef.current(response.credential),
          cancel_on_tap_outside: true,
        })
        // Limpia cualquier boton previo antes de re-renderizar (ej. cambio de tema)
        containerRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: dark ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          width: containerRef.current.offsetWidth || 300,
        })
      })
      .catch(err => onError?.(err.message))

    return () => {
      cancelled = true
      // Cancela el prompt de GSI para que no siga manipulando el DOM
      // despues de que React desmonte este contenedor (ej. al navegar
      // entre /login y /register), que es lo que causaba el crash
      // "insertBefore" al cambiar de pagina.
      window.google?.accounts?.id?.cancel()
    }
  }, [dark])

  return <div ref={containerRef} id={`google-btn-${domId}`} className="w-full flex justify-center" />
}
