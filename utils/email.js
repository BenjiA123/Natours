const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Three steps of nodemailer
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 25,
    auth: {
      user: '40c302ca9ec2c5',
      pass: '47e2e62ef6be09',
    },
  });

  // Define email Options

  const  mailOptions = {
    from: '"Natours Team" <teck@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message, 
    // html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
};

  // Send the email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
