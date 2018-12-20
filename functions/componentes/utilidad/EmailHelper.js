const nodemailer = require('nodemailer')
const functions = require('firebase-functions')

class Email {
  constructor () {
    const userEmail = functions.config().configuration.email
    const passwordEmail = functions.config().configuration.password

    this.mailTransport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      tls: { rejectUnauthorized: false },
      auth: {
        user: userEmail,
        pass: passwordEmail
      }
    })
  }

  sendEmail (from, to, bcc, subject, bodyHTML) {
    const mailOptions = {
      from: from,
      to: to,
      bcc: bcc
    }

    mailOptions.subject = subject
    mailOptions.html = bodyHTML

    return this.mailTransport.sendMail(mailOptions)
  }
}

exports.Email = Email
