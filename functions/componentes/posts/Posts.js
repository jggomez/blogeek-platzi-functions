const admin = require('firebase-admin')
const functions = require('firebase-functions')
const path = require('path')
const os = require('os')
const fs = require('fs')
const vision = require('@google-cloud/vision')
const { Email } = require('./../utilidad/EmailHelper.js')
const plantillas = require('./../utilidad/PlantillasEmail.js')
const { Notificaciones } = require('./../notificaciones/Notificaciones.js')

class Posts {
  registrarAuditoria (idPost, nuevoPost, viejoPost) {
    const refAuditoria = admin.firestore().collection('auditoriaPosts')

    return refAuditoria
      .add({
        idPost: idPost,
        nuevo: nuevoPost,
        viejo: viejoPost
      })
      .catch(error => {
        console.error(`Error insertando la auditoria => ${error}`)
      })
  }

  validarImagenPost (archivo) {
    const rutaArchivo = archivo.name
    const nombreArchivo = path.basename(rutaArchivo)
    const idPost = path.basename(rutaArchivo).split('.')[0]
    const bucket = admin.storage().bucket()
    const tempRutaArchivo = path.join(os.tmpdir(), nombreArchivo)
    const metadata = {
      contentType: archivo.contentType
    }

    const client = new vision.ImageAnnotatorClient()

    return bucket
      .file(rutaArchivo)
      .download({
        destination: tempRutaArchivo
      })
      .then(() => {
        return client.safeSearchDetection(tempRutaArchivo)
      })
      .then(resultado => {
        console.log(resultado[0].safeSearchAnnotation)
        const adulto = resultado[0].safeSearchAnnotation.adult
        const medical = resultado[0].safeSearchAnnotation.medical
        const spoof = resultado[0].safeSearchAnnotation.spoof
        const violence = resultado[0].safeSearchAnnotation.violence
        const racy = resultado[0].safeSearchAnnotation.racy
        return (
          this.esAdecuada(adulto) &&
          this.esAdecuada(medical) &&
          this.esAdecuada(spoof) &&
          this.esAdecuada(violence) &&
          this.esAdecuada(racy)
        )
      })
      .then(resp => {
        if (resp) {
          console.log(`Actualizar estado idPost => ${idPost}`)
          this.actualizarEstadoPost(idPost, true)
          return resp
        }

        return this.enviarNotRespImagenInapropiada(idPost)
      })
  }

  esAdecuada (resultado) {
    return (
      resultado !== 'POSSIBLE' &&
      resultado !== 'LIKELY' &&
      resultado !== 'VERY_LIKELY'
    )
  }

  actualizarEstadoPost (idPost, estado) {
    const refAuditoria = admin
      .firestore()
      .collection('posts')
      .doc(idPost)

    return refAuditoria.update({
      publicado: estado
    })
  }

  enviarNotRespImagenInapropiada (idPost) {
    console.log(`Consultar Token idPost => ${idPost}`)

    return admin
      .firestore()
      .collection('posts')
      .doc(idPost)
      .get()
      .then(post => {
        console.log(post)
        if (post.data().token !== null && post.data().token !== undefined) {
          console.log(`idPost token => ${post.data().token}`)
          const notificaciones = new Notificaciones()
          notificaciones.enviarNotificacionAToken(
            'Posts con imagen no permitida',
            'Tu post no se puede mostrar ya que la imagen no es permitida',
            'notvalidacionimagen',
            post.data().token
          )
        }

        return post
      })
  }

  enviarPostSemana (topicoNotificacion) {
    const fechaFin = new Date()
    let fechaInicial = new Date()
    fechaInicial.setDate(fechaInicial.getDate() - 5)
    let emails = ''

    return admin
      .firestore()
      .collection('emailsusuarios')
      .get()
      .then(emailUsuarios => {
        emailUsuarios.forEach(emailUsuario => {
          emails += `${emailUsuario.data().email},`
        })
        console.log(emails)
        return emails
      })
      .then(() => {
        return admin
          .firestore()
          .collection('posts')
          .where('fecha', '>=', fechaInicial)
          .where('fecha', '<=', fechaFin)
          .where('publicado', '==', true)
          .get()
      })
      .then(posts => {
        if (!posts.empty) {
          console.log('Entro a los post de la semana')
          const textHtml = plantillas.plantillaVideosLaSemana(posts)
          const objEmail = new Email()

          console.log(emails)

          return objEmail.sendEmail(
            'info@blogeek.co',
            emails,
            '',
            'Video Blogeek - Los Videos Geek de la semana',
            textHtml
          )
        }

        return null
      })
      .then(resp => {
        if (resp) {
          console.log('Entro a la notificación de los post de la semana')
          const notificaciones = new Notificaciones()
          return notificaciones.enviarNotificacion(
            'Posts de la semana',
            'Ya te compartimos a tu email los posts de la semana',
            topicoNotificacion,
            'nottodospostsemana'
          )
        }

        return null
      })
  }
}

exports.Posts = Posts
