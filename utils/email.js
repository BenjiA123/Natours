const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text')

module.exports = class Email{
  constructor(user,url){
    this.to =user.email
    this.firstname = user.name.split(' ')[0]
    this.url= url
    this.from = `"Teck Team" <${process.env.EMAIL_FORM}>`
  }

  newTransport(){
    if(process.env.NODE_ENV === 'production'){
      // SEND GRID
      // return nodemailer.createTransport({
      //   service:'SendGrid',
      //   auth:{
      //     user: SENDGRID_USERNAME,
      //     pass: SENDGRID_PASSWORD,
      //   }
      // })
      return 1 //Just a place holder till i fix sendGrid
    }

    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 25,
      auth: {
        user: '40c302ca9ec2c5',
        pass: '47e2e62ef6be09',
      },
    });
  }

  async send(template,subject){
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,
    {
      firstName:this.firstname,
      url:this.url,
      subject
    })

    const  mailOptions = {
      from: this.from,
      to:this.to,
      subject,
      html,
      text:htmlToText.fromString(html)
  };
  
  this.newTransport().sendMail(mailOptions)

  }

  async sendWelcome(){
    await this.send('Welcome',"Welcome to the natours Family")
  }

  async sendPasswordReset(){
    await this.send('passwordReset','Your Password reset token is valid for 10 minutes')
  }
}

