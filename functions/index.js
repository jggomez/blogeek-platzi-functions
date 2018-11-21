const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

exports.registrarTopico = functions.firestore
  .document('/tokens/{id}')
  .onCreate(dataSnapshot => {
    const token = dataSnapshot.data().token

    const registrationTokens = [token]

    return admin
      .messaging()
      .subscribeToTopic(registrationTokens, 'NuevosPosts')
      .then(() => {
        return console.log(`Adiciona correctamente al topico`)
      })
      .catch(error => {
        console.error(`Error registrando al topico el token => ${error}`)
      })
  })

exports.enviarNotificacion = functions.firestore
  .document('/posts/{idPost}')
  .onCreate(dataSnapshot => {
    const titulo = dataSnapshot.data().titulo
    const descripcion = dataSnapshot.data().descripcion

    const mensaje = {
      data: {
        titulo: titulo,
        descripcion: descripcion
      },
      topic: 'NuevosPosts'
    }

    return admin
      .messaging()
      .send(mensaje)
      .then(() => {
        return console.log(`Mensaje enviado correctamente`)
      })
      .catch(error => {
        console.error(`Error enviando mensaje => ${error}`)
      })
  })
