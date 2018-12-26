const functions = require('firebase-functions')
const admin = require('firebase-admin')

exports.renderPost = functions.https.onRequest((req, resp) => {
  return admin
    .firestore()
    .collection('posts')
    .doc(req.query.idPost)
    .get()
    .then(post => {
      return resp.status(200).send(`<!doctype html>
      <head>
        <title>Post</title>
      </head>
      <body>        
        Titulo : ${post.data().titulo}
        Autor : ${post.data().autor}
        Fecha : ${post.data().fecha}
      </body>
    </html>`)
    })
})

{
    "hosting": {
      "public": "public",
        
      "rewrites": [ {
        "source": "/post", "function": "renderPost"
      } ]
    }
}
