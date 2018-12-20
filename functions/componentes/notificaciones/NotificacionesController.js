const Notificaciones = require('./Notificaciones.js')

exports.creacionTokenController = dataSnapshot => {
  const notificaciones = new Notificaciones.Notificaciones()

  return notificaciones.registrarTokenAlTopico(dataSnapshot.data().token)
}
