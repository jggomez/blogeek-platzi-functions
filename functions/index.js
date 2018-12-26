const functions = require('firebase-functions')
const admin = require('firebase-admin')
const usuarioController = require('./componentes/usuarios/UsuarioController.js')
const notificacionController = require('./componentes/notificaciones/NotificacionesController.js')
const postsController = require('./componentes/posts/PostsController.js')
const errorController = require('./componentes/errores/ErrorController.js')
const analiticasController = require('./componentes/analiticas/AnaliticasController.js')
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
admin.initializeApp()
admin.firestore().settings({ timestampsInSnapshots: true })

app.post('/v1', (req, resp, next) => {
  return postsController
    .enviarPostsSemana(req.body.data.topico)
    .then(() => {
      return resp.status(200).json({
        resultado: true
      })
    })
    .catch(error => {
      return next(new Error(error.toString()))
    })
})

app.use((error, req, res, next) => {
  if (error) {
    console.error(`Error en las funciones HTTPS => ${error.message}`)
    return res.status(500).json({
      responseCode: 500,
      responseError: error.message
    })
  }

  return console.error(`Error en las funciones HTTPS`)
})

// firebase functions:config:set configuration.email="XXXX" configuration.password="XXXXXX"
// firebase functions:config:set configuration.claveapihubspot="XXXX"
// firebase functions:config:set configuration.numcelularerror="XXXX"
// firebase functions:config:set configuration.accountsidtwilio="XXXX"
// firebase functions:config:set configuration.authtokentwilio="XXXX"
exports.creacionUsuario = functions.auth
  .user()
  .onCreate(usuarioController.usuarioCreacionController)

exports.creacionUsuarioCRM = functions.auth
  .user()
  .onCreate(usuarioController.creacionUsuarioCRM)

exports.eliminacionUsuario = functions.auth
  .user()
  .onDelete(usuarioController.usuarioEliminadoController)

exports.registrarTopico = functions.firestore
  .document('/tokens/{id}')
  .onCreate(notificacionController.creacionTokenController)

exports.enviarNotificacion = functions.firestore
  .document('/posts/{idPost}')
  .onUpdate(postsController.actualizacionPostController)

exports.auditoriaPosts = functions.firestore
  .document('/posts/{idPost}')
  .onUpdate(postsController.auditoriaPostController)

exports.validarImagen = functions.storage
  .object()
  .onFinalize(postsController.validarImagenPostController)

exports.enviarPostSemana = functions.https.onRequest(app)

exports.enviarErrorNuevoAPPSMS = functions.crashlytics
  .issue()
  .onNew(errorController.handler)

exports.enviarErrorRecurrenteAPPSMS = functions.crashlytics
  .issue()
  .onRegressed(errorController.handler)

exports.enviarInfoCompartir = functions.analytics
  .event('share')
  .onLog(analiticasController.enviarCuponCompartir)

exports.renderPost = functions.https.onRequest((req, resp) => {
  console.log(req.query.idPost)
  return admin
    .firestore()
    .collection('posts')
    .doc(req.query.idPost)
    .get()
    .then(post => {
      resp.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      return resp.status(200).send(`<!doctype html>
        <head>
          <title>Post</title>
        </head>
        <body>
            <article>
              <div>
                  <h2>${post.data().titulo}</h2>
              </div>
              <div>
                  <iframe type="text/html" width="500" height="385" src='${
                      post.data().videoLink}'
                      frameborder="0"></iframe>
              </div>
              <div>
                  Video
              </div>
              <div>
                  <p>${post.data().descripcion}</p>
              </div>
            </article>
        </body>
      </html>`)
    })
})
