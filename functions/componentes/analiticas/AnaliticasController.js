const { SMSHelper } = require('./../utilidad/SMSHelper.js')
const functions = require('firebase-functions')

exports.enviarCuponCompartir = evento => {
  const redSocial = evento.params.method
  console.log(evento)
  const numCelular = functions.config().configuration.numcelularerror

  return SMSHelper(
    `Por compartir en ${redSocial}, te has ganado un premio. Blogeek}`,
    numCelular
  ).catch(error => {
    console.error(`Error enviando SMS => ${error}`)
  })
}
