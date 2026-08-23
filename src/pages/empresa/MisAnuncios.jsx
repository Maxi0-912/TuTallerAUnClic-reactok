import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

const TIPOS = [
  { value: 'imagen',       label: 'Solo imagen' },
  { value: 'imagen_texto', label: 'Imagen con texto' },
  { value: 'imagen_boton', label: 'Imagen con boton' },
]

const CATEGORIAS = [
  { value: 'banner', label: 'Banner' },
  { value: 'oferta',  label: 'Oferta' },
]

const UBICACIONES = [
  { value: 'perfil', label: 'Perfil del establecimiento' },
  { value: 'banner', label: 'Banner / carrusel del home' },
]

const ESTADOS = {
  pendiente: { label: 'Pendiente',  color: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400' },
  aprobado:  { label: 'Aprobado',   color: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400' },
  rechazado: { label: 'Rechazado',  color: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400' },
}

const EMPTY = {
  titulo: '', descripcion: '', tipo: 'imagen',
  categoria: 'banner', descuento: '',
  texto_boton: '', url_boton: '', establecimiento: '',
  servicio: '', ubicaciones: [],
  fecha_inicio: '', fecha_fin: '',
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}

function CheckboxUbicaciones({ value, onChange }) {
  function toggle(v) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  }
  return (
    <div className="flex flex-col gap-2">
      {UBICACIONES.map(u => (
        <label key={u.value} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" checked={value.includes(u.value)} onChange={() => toggle(u.value)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
          {u.label}
        </label>
      ))}
    </div>
  )
}

function BadgeEstado({ estado }) {
  const cfg = ESTADOS[estado] ?? ESTADOS.pendiente
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function formatCOP(monto) {
  const n = Number(monto)
  if (Number.isNaN(n)) return monto
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

function CopyField({ label, value, highlight = false }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(String(value))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border ${
        highlight
          ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
      }`}>
        <span className={`font-mono ${highlight ? 'text-base font-bold text-blue-700 dark:text-blue-300' : 'text-sm text-gray-800 dark:text-gray-100'}`}>
          {value}
        </span>
        <button onClick={copiar}
          className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          {copiado ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

function ModalPago({ anuncio, onClose }) {
  const [info, setInfo]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError('')
    api.post(`/api/empresa/anuncios/${anuncio.id}/pago/`)
      .then(res => { if (!cancelado) setInfo(res.data) })
      .catch(() => { if (!cancelado) setError('No se pudo generar la informacion de pago. Intenta mas tarde.') })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [anuncio.id])

  const pasos = [
    'Abri la app de Nequi',
    'Transferi el monto al numero indicado',
    'En la descripcion del envio, escribi la referencia',
    'Confirma el envio en Nequi',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Completar pago</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>
          )}

          {!loading && !error && info && (
            <>
              <div className="text-center py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monto a transferir</p>
                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{formatCOP(info.monto)}</p>
              </div>

              <CopyField label="Numero Nequi" value={info.numero_nequi} />
              <CopyField label="Titular de la cuenta" value={info.titular} />
              <CopyField label="Referencia (poner en la descripcion del envio)" value={info.referencia} highlight />

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Pasos</p>
                <ol className="flex flex-col gap-1.5">
                  {pasos.map((paso, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="shrink-0 w-4 h-4 mt-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {paso}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-lg">
                La verificacion del pago es manual y puede tardar. Tu anuncio se publica recien cuando se confirme el pago.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            Ya transferi
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MisAnuncios() {
  const [anuncios, setAnuncios]         = useState([])
  const [establecimientos, setEstabs]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(false)
  const [editing, setEditing]           = useState(null)
  const [form, setForm]                 = useState(EMPTY)
  const [imagenFile, setImagenFile]     = useState(null)
  const [preview, setPreview]           = useState(null)
  const [cupoInfo, setCupoInfo]         = useState(null)
  const [servicios, setServicios]       = useState([])
  const [usarEnlace, setUsarEnlace]     = useState(false)
  const [montoPreview, setMontoPreview] = useState(null)
  const [saving, setSaving]             = useState(false)
  const [deleteId, setDeleteId]         = useState(null)
  const [pagoAnuncio, setPagoAnuncio]   = useState(null)
  const [error, setError]               = useState('')
  const [notice, setNotice]             = useState(null)
  const fileRef                         = useRef(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [a, e] = await Promise.all([
        api.get('/api/empresa/anuncios/'),
        api.get('/empresa/mis-establecimientos/'),
      ])
      setAnuncios(Array.isArray(a.data) ? a.data : a.data.results ?? [])
      setEstabs(Array.isArray(e.data) ? e.data : e.data.results ?? [])
    } catch { }
    setLoading(false)
  }

  async function fetchCupo(estId) {
    if (!estId) { setCupoInfo(null); return }
    try {
      const res = await api.get('/api/empresa/anuncios/cupo/', { params: { establecimiento: estId } })
      setCupoInfo(res.data)
    } catch { setCupoInfo(null) }
  }

  async function fetchServicios(estId) {
    if (!estId) { setServicios([]); return }
    try {
      const res = await api.get(`/servicios/establecimiento/${estId}/`)
      setServicios(Array.isArray(res.data) ? res.data : res.data.results ?? [])
    } catch { setServicios([]) }
  }

  useEffect(() => {
    if (form.ubicaciones.length === 0) { setMontoPreview(null); return }
    let cancelado = false
    api.get('/api/empresa/anuncios/tarifa/', { params: { ubicaciones: form.ubicaciones.join(',') } })
      .then(res => { if (!cancelado) setMontoPreview(res.data.monto) })
      .catch(() => { if (!cancelado) setMontoPreview(null) })
    return () => { cancelado = true }
  }, [form.ubicaciones])

  function openCreate() {
    setEditing(null)
    const first = establecimientos.length === 1 ? String(establecimientos[0].id) : ''
    setForm({ ...EMPTY, establecimiento: first })
    setImagenFile(null)
    setPreview(null)
    setCupoInfo(null)
    setServicios([])
    setUsarEnlace(false)
    setError('')
    setModal(true)
    if (first) { fetchCupo(first); fetchServicios(first) }
  }

  function openEdit(a) {
    setEditing(a)
    setForm({
      titulo:          a.titulo         ?? '',
      descripcion:     a.descripcion    ?? '',
      tipo:            a.tipo           ?? 'imagen',
      categoria:       a.categoria      ?? 'banner',
      descuento:       a.descuento      ?? '',
      texto_boton:     a.texto_boton    ?? '',
      url_boton:       a.url_boton      ?? '',
      establecimiento: a.establecimiento ?? '',
      servicio:        a.servicio?.id   ?? '',
      ubicaciones:     a.ubicaciones    ?? [],
      fecha_inicio:    a.fecha_inicio   ?? '',
      fecha_fin:       a.fecha_fin      ?? '',
    })
    setImagenFile(null)
    setPreview(a.imagen_url ?? null)
    setCupoInfo(null)
    setUsarEnlace(!a.servicio && !!a.url_boton)
    setError('')
    setModal(true)
    if (a.establecimiento) fetchServicios(a.establecimiento)
  }

  function f(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function handleEstablecimiento(v) {
    setForm(p => ({ ...p, establecimiento: v, servicio: '' }))
    if (!editing) fetchCupo(v)
    fetchServicios(v)
  }

  function handleServicio(v) {
    setForm(p => ({ ...p, servicio: v }))
    if (v) setUsarEnlace(false)
  }

  function toggleUsarEnlace(checked) {
    setUsarEnlace(checked)
    if (checked) setForm(p => ({ ...p, servicio: '' }))
    else setForm(p => ({ ...p, texto_boton: '', url_boton: '' }))
  }

  function handleImagen(e) {
    const file = e.target.files[0]
    if (!file) return
    setImagenFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setError('')
    if (!form.establecimiento) { setError('Selecciona un establecimiento'); return }
    if (!imagenFile && !editing) { setError('La imagen es obligatoria'); return }
    if (form.ubicaciones.length === 0) { setError('Selecciona al menos una ubicacion'); return }

    setSaving(true)
    try {
      const payload = new FormData()
      const campos = ['titulo', 'descripcion', 'tipo', 'categoria', 'descuento',
                       'texto_boton', 'url_boton', 'establecimiento', 'fecha_inicio', 'fecha_fin']
      campos.forEach(k => { if (form[k] !== '' && form[k] !== null && form[k] !== undefined) payload.append(k, form[k]) })
      payload.append('ubicaciones', JSON.stringify(form.ubicaciones))
      if (form.servicio) payload.append('servicio_id', form.servicio)
      if (imagenFile) payload.append('imagen', imagenFile)

      let res
      if (editing) {
        res = await api.patch(`/api/empresa/anuncios/${editing.id}/`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        res = await api.post('/api/empresa/anuncios/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setModal(false)
      setNotice({
        type: 'success',
        text: res.data?.requiere_pago
          ? 'Tu anuncio fue guardado. Al superar tu cupo gratis, quedara pendiente de pago y de aprobacion.'
          : 'Tu anuncio fue guardado y queda pendiente de aprobacion.'
      })
      fetchAll()
    } catch (e) {
      setError('Error al guardar el anuncio')
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/empresa/anuncios/${id}/`)
      setDeleteId(null)
      fetchAll()
    } catch { }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Mis anuncios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Promociona tus establecimientos en el home</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo anuncio
        </button>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm">
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="shrink-0 text-green-700 dark:text-green-400 hover:opacity-70">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : anuncios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-gray-400 text-sm">No tienes anuncios creados</p>
            <button onClick={openCreate} className="text-blue-600 text-sm hover:underline">Crear el primero</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left">Imagen</th>
                  <th className="px-4 py-3 text-left">Titulo</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Establecimiento</th>
                  <th className="px-4 py-3 text-left">Ubicaciones</th>
                  <th className="px-4 py-3 text-left">Vigencia</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Pago</th>
                  <th className="px-4 py-3 text-left">Citas</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {anuncios.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      {a.imagen_url ? (
                        <img src={a.imagen_url} alt={a.titulo}
                          className="w-16 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-16 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{a.titulo || <span className="text-gray-400 italic">Sin titulo</span>}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium">
                        {TIPOS.find(t => t.value === a.tipo)?.label ?? a.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.establecimiento_nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(a.ubicaciones ?? []).length === 0
                          ? <span className="text-gray-400">—</span>
                          : a.ubicaciones.map(u => (
                              <span key={u} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                {UBICACIONES.find(x => x.value === u)?.label ?? u}
                              </span>
                            ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {a.fecha_inicio || a.fecha_fin
                        ? `${a.fecha_inicio ?? '∞'} → ${a.fecha_fin ?? '∞'}`
                        : <span className="text-gray-400">Sin limite</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <BadgeEstado estado={a.estado} />
                        {a.estado === 'rechazado' && a.motivo_rechazo && (
                          <span className="text-xs text-red-500 max-w-[16rem]">{a.motivo_rechazo}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.es_pago ? (
                        a.pagado ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400">
                            Pagado
                          </span>
                        ) : (
                          <button onClick={() => setPagoAnuncio(a)}
                            className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors cursor-pointer">
                            Pago pendiente
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">Gratis</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {a.citas_generadas_count ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(a)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteId(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-500 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                {editing ? 'Editar anuncio' : 'Nuevo anuncio'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">

              {editing && (
                <div className="flex items-center gap-2">
                  <BadgeEstado estado={editing.estado} />
                  {editing.estado === 'rechazado' && editing.motivo_rechazo && (
                    <span className="text-xs text-red-500">Motivo: {editing.motivo_rechazo}</span>
                  )}
                </div>
              )}

              {/* Preview imagen */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Imagen del anuncio *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer overflow-hidden transition-colors group"
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Cambiar imagen</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                      </svg>
                      <span className="text-xs text-gray-400">Click para subir imagen</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">JPG, PNG, WEBP recomendado 1920x600</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
              </div>

              {/* Tipo y categoria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo de anuncio</label>
                  <select value={form.tipo} onChange={e => f('tipo', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
                  <select value={form.categoria} onChange={e => f('categoria', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Descuento — solo si la categoria es oferta */}
              {form.categoria === 'oferta' && (
                <Field label="Descuento" value={form.descuento} onChange={v => f('descuento', v)} placeholder="ej: 20% OFF" />
              )}

              {/* Titulo y descripcion — solo si no es solo imagen */}
              {form.tipo !== 'imagen' && (
                <>
                  <Field label="Titulo" value={form.titulo} onChange={v => f('titulo', v)} />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descripcion</label>
                    <textarea value={form.descripcion} onChange={e => f('descripcion', e.target.value)} rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </>
              )}

              {/* Establecimiento */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Establecimiento *</label>
                <select value={form.establecimiento} onChange={e => handleEstablecimiento(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Seleccionar —</option>
                  {establecimientos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>

              {/* Cupo — solo al crear */}
              {!editing && form.establecimiento && cupoInfo && (
                <div className={`text-xs rounded-lg px-3 py-2 ${cupoInfo.proximo_requiere_pago
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                  : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'}`}>
                  Te quedan {cupoInfo.gratis_restantes} anuncio{cupoInfo.gratis_restantes !== 1 ? 's' : ''} gratis de {cupoInfo.cupo_gratis}.
                  {cupoInfo.proximo_requiere_pago && ' El siguiente anuncio que publiques sera de pago.'}
                </div>
              )}

              {/* Ubicaciones */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Donde se muestra *</label>
                <CheckboxUbicaciones value={form.ubicaciones} onChange={v => f('ubicaciones', v)} />
                {montoPreview !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Si esta combinacion requiere pago, el monto es de <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCOP(montoPreview)}</span>.
                  </p>
                )}
              </div>

              {/* Servicio asociado — permite agendar directo desde el anuncio */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Servicio asociado (opcional)</label>
                <select value={form.servicio} onChange={e => handleServicio(e.target.value)}
                  disabled={!form.establecimiento}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                  <option value="">Sin servicio (solo visual)</option>
                  {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Si eliges un servicio, el anuncio se puede tocar para agendarlo directo (el usuario solo elige fecha y hora).
                </p>
              </div>

              {/* Enlace externo — alternativa minoritaria al agendamiento */}
              {!form.servicio && (
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={usarEnlace} onChange={e => toggleUsarEnlace(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                    Usar un enlace externo en vez de agendamiento
                  </label>
                  {usarEnlace && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <Field label="Texto del boton" value={form.texto_boton} onChange={v => f('texto_boton', v)} placeholder="Ver más" />
                      <Field label="URL del boton" value={form.url_boton} onChange={v => f('url_boton', v)} placeholder="https://..." />
                    </div>
                  )}
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={v => f('fecha_inicio', v)} />
                <Field label="Fecha fin"    type="date" value={form.fecha_fin}    onChange={v => f('fecha_fin', v)} />
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors flex items-center gap-2">
                {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear anuncio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pago */}
      {pagoAnuncio && (
        <ModalPago anuncio={pagoAnuncio} onClose={() => setPagoAnuncio(null)} />
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Eliminar anuncio</h3>
            <p className="text-sm text-gray-500 mb-5">Esta accion no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
