const { Notificaciones } = require('./../notificaciones/Notificaciones.js')
const { Posts } = require('./Posts.js')

exports.actualizacionPostController = (dataSnapshot) => {
  const notificaciones = new Notificaciones()

  if (
    dataSnapshot.before.data().publicado === false &&
    dataSnapshot.after.data().publicado === true
  ) {
    return notificaciones.enviarNotificacion(
      dataSnapshot.after.data().titulo,
      dataSnapshot.after.data().descripcion,
      null,
      ''
    )
  }

  return null
}

exports.auditoriaPostController = (dataSnapshot, context) => {
  const posts = new Posts()

  return posts.registrarAuditoria(
    context.params.idPost,
    dataSnapshot.after.data(),
    dataSnapshot.before.data()
  )
}

exports.validarImagenPostController = imagen => {
  if (!imagen.name.match(/imgsposts/)) {
    return null
  }

  if (!imagen.contentType.startsWith('image/')) {
    console.error('This is not an image.')
    return null
  }

  const posts = new Posts()

  return posts.validarImagenPost(imagen).catch(error => {
    console.error(`Error validando la imagen del Post => ${error}`)
  })
}

exports.enviarPostsSemana = (topico) => {
  const posts = new Posts()
  return posts.enviarPostSemana(topico)
}
