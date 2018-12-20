const { Notificaciones } = require('./../notificaciones/Notificaciones.js')
const { Posts } = require('./Posts.js')

exports.actualizacionPostController = (dataSnapshot, context) => {
  const notificaciones = new Notificaciones()

  if (
    dataSnapshot.before.data().publicado === false &&
    dataSnapshot.after.data().publicado === true
  ) {
    return notificaciones.enviarNotificacion(
      dataSnapshot.after.data().titulo,
      dataSnapshot.after.data().descripcion,
      null,
      ""
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

exports.enviarPostsSemana = (req, resp, next) => {
  const posts = new Posts()
  const topico = req.body.data.topico
  return posts
    .enviarPostSemana(topico)
    .then(result => {
      return resp.status(200).json({
        resultado: true
      })
    })
    .catch(error => {
      return next(new Error(error.toString()))
    })
}
