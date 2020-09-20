var nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER_ID,
        pass: process.env.EMAIL_USER_PASS
    }
});

const defaultEmailConfig = {
    from: '"Social Network API" <admin@socialnetwork.com>',
    errorRecipient: process.env.EMAIL_USER_ID
}

module.exports = {

    send: function (to, subject, message, html) {
        mailTransport.sendMail({
            from: defaultEmailConfig.from,
            to: to,
            subject: subject,
            text: message,
            html: html
        }, function (err) {
            if (err)
                console.error('Unable to send email:' + err);
        });
    },
    emailError: function (message, filename, exception) {
        var body = '<h1>Social Network API Error</h1>' +
            'message:<br><pre>' + message + '</pre><br>';
        if (exception) body += 'exception:<br><pre>' + exception
            + '</pre><br>';
        if (filename) body += 'filename:<br><pre>' + filename
            + '</pre><br>';
        mailTransport.sendMail({
            from: defaultEmailConfig.from,
            to: defaultEmailConfig.errorRecipient,
            subject: 'Social Network API Error',
            html: body,
            generateTextFromHtml: true
        }, function (err) {
            if (err) console.error('Unable to send email: ' + err);
        });
    }
}
