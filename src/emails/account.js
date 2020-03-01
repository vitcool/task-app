const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'vitalikulyk@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Hello, ${name}! We are happy to see you there! Welcome to the app!`
  });
};

const removeAccountEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'vitalikulyk@gmail.com',
    subject: 'Do u really want to leave us?',
    text: `Hello, ${name}! We are so sorry to lost you as a user our platform...`
  });
};

module.exports = {
  sendWelcomeEmail,
  removeAccountEmail
};