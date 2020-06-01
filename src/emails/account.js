const sgMail = require('@sendgrid/mail');
const sendGridKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendGridKey);


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'robimilani@gmail.com',
        subject: 'Welcome to Task Manager!',
        text: `Hi ${name}, 

Thank you for using the Task Manager app. I hope you will enjoy it!`
    });
}


const sendFarewellEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'robimilani@gmail.com',
        subject: 'Cancellation from Task Manager',
        text: `Hi ${name},

Your account has been entirely removed from the Task Manager database. Hope to see you back soon!`
    })
}

module.exports = { sendWelcomeEmail, sendFarewellEmail }