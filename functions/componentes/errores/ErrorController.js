const { SMSHelper } = require('./../utilidad/SMSHelper.js')
const functions = require('firebase-functions')

exports.handler = issue => {
  console.log(issue)

  const issueTitulo = issue.issueTitle
  const appName = issue.appName

  const numCelular = functions.config().configuration.numcelularerror

  const mensaje = `Error en la app ${appName} = ${issueTitulo}`

  return SMSHelper(mensaje, numCelular).catch(error => {
    console.error(
      `No se pudo enviar el SMS sobre el error de la app => ${error}`
    )
  })
}
