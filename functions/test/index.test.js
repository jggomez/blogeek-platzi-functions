const { configProjectTest, mockConfig } = require('./configTest.js')

const test = require('firebase-functions-test')(
  configProjectTest(),
  './test/credenciales.json'
)

test.mockConfig(mockConfig())

const funciones = require('./../index.js')

describe('funciones', () => {
  after(() => {
    test.cleanup()
  })

  describe('enviarErrorNuevoAPPSMS', () => {
    it('SMS enviado', done => {
      const errorNuevoWrap = test.wrap(funciones.enviarErrorNuevoAPPSMS)
      const data = test.crashlytics.exampleIssue()
      errorNuevoWrap(data)
        .then(() => {
          return done()
        })
        .catch(error => {
          done(error)
        })
    })
  })

  describe('enviarNotificacion', () => {
    it('enviar notificacion', done => {
      const enviarNotificacionWrap = test.wrap(funciones.enviarNotificacion)
      const dataAfter = test.firestore.makeDocumentSnapshot(
        {
          publicado: true,
          titulo: 'Prueba',
          descripcion: 'Prueba'
        },
        ''
      )

      const dataBefore = test.firestore.makeDocumentSnapshot(
        {
          publicado: false
        },
        ''
      )

      const cambios = test.makeChange(dataBefore, dataAfter)

      enviarNotificacionWrap(cambios)
        .then(() => {
          return done()
        })
        .catch(error => {
          done(error)
        })
    })
  })
})
