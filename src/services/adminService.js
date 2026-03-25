import api from './api'

export const adminService = {
  // Usuarios
  getUsuarios:       () => api.get('/api/admin/usuarios/'),
  createUsuario:     (data) => api.post('/api/admin/usuarios/', data),
  updateUsuario:     (id, data) => api.patch(`/api/admin/usuarios/${id}/`, data),
  deleteUsuario:     (id) => api.delete(`/api/admin/usuarios/${id}/`),

  // Establecimientos
  getEstablecimientos:   () => api.get('/establecimientos/'),
  createEstablecimiento: (data) => {
    const formData = new FormData()

    formData.append('nombre', data.nombre)
    formData.append('direccion', data.direccion)
    formData.append('telefono', data.telefono)
    formData.append('hora_apertura', data.hora_apertura)
    formData.append('hora_cierre', data.hora_cierre)
    formData.append('descripcion', data.descripcion)
    formData.append('latitud', data.latitud)
    formData.append('longitud', data.longitud)
    formData.append('tipo', data.tipo)
    formData.append('propietario', data.propietario)

    // 👇 igual que en perfil
    if (data.foto) {
      formData.append('foto', data.foto)
    }

    return api.post('/establecimientos/crear/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },  
  updateEstablecimiento: (id, data) => {
    const formData = new FormData()
  
    formData.append('nombre', data.nombre)
    formData.append('direccion', data.direccion)
    formData.append('telefono', data.telefono)
    formData.append('hora_apertura', data.hora_apertura)
    formData.append('hora_cierre', data.hora_cierre)
    formData.append('descripcion', data.descripcion)
    formData.append('latitud', data.latitud)
    formData.append('longitud', data.longitud)
    formData.append('tipo', data.tipo)
    formData.append('propietario', data.propietario)
  
    if (data.foto) {
      formData.append('foto', data.foto)
    }
  
    return api.patch(`/api/admin/establecimientos/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteEstablecimiento: (id) => api.delete(`/api/admin/establecimientos/${id}/`),

  // Servicios
  getServicios:   () => api.get('/api/admin/servicios/'), 
  createServicio: (data) => api.post('/api/admin/servicios/', data),
  updateServicio:    (id, data) => api.patch(`/api/admin/servicios/${id}/`, data),
  deleteServicio:    (id) => api.delete(`/api/admin/servicios/${id}/`),

  // Prestaciones
  getPrestaciones:   () => api.get('/api/admin/prestaciones/'),
  createPrestacion:  (data) => api.post('/api/admin/prestaciones/', data),
  updatePrestacion:  (id, data) => api.patch(`/api/admin/prestaciones/${id}/`, data),
  deletePrestacion:  (id) => api.delete(`/api/admin/prestaciones/${id}/`),

  // Calificaciones
  getCalificaciones: () => api.get('/api/admin/calificaciones/'),
  createCalificacion:(data) => api.post('/api/admin/calificaciones/', data),
  updateCalificacion:(id, data) => api.patch(`/api/admin/calificaciones/${id}/`, data),
  deleteCalificacion:(id) => api.delete(`/api/admin/calificaciones/${id}/`),

  // Notificaciones
  getNotificaciones: () => api.get('/api/admin/notificaciones/'),
  createNotificacion:(data) => api.post('/api/admin/notificaciones/', data),
  updateNotificacion:(id, data) => api.patch(`/api/admin/notificaciones/${id}/`, data),
  deleteNotificacion:(id) => api.delete(`/api/admin/notificaciones/${id}/`),

  // Vehiculos
  getVehiculos:      () => api.get('/api/admin/vehiculos/'),
  createVehiculo:    (data) => api.post('/api/admin/vehiculos/', data),
  updateVehiculo:    (placa, data) => api.patch(`/api/admin/vehiculos/${placa}/`, data),
  deleteVehiculo:    (placa) => api.delete(`/api/admin/vehiculos/${placa}/`),

  // Roles
  getRoles:          () => api.get('/api/admin/roles/'),
  createRol:         (data) => api.post('/api/admin/roles/', data),
  updateRol:         (id, data) => api.patch(`/api/admin/roles/${id}/`, data),
  deleteRol:         (id) => api.delete(`/api/admin/roles/${id}/`),

  // Auxiliares sin autenticacion admin
  getRolesPublicos:        () => api.get('/roles/'),
  getTiposEstablecimiento: () => api.get('/tipos-establecimiento/'),
  getTiposServicio:        () => api.get('/tipos-servicio/'),
  getAgenda:               () => api.get('/api/admin/agenda/'),
}