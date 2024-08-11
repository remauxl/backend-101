const nodemailer = require("nodemailer");
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT, // Corrected from EMAIL_PASSWORD to EMAIL_PORT
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        try {
            // Render HTML
            const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject
            });

            // Email options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: htmlToText.convert(html)
            };

            // Create transport and send email
            await this.newTransport().sendMail(mailOptions);
            console.log(`Email sent successfully to ${this.to}`);
        } catch (error) {
            console.error(`Failed to send email to ${this.to}:`, error.message);
            // Optionally rethrow the error if you want to handle it further up the call stack
            throw error;
        }
    }

    async sendWelcome() {
        try {
            await this.send('Welcome', 'Welcome to our galaxy!');
        } catch (error) {
            console.error('Error sending welcome email:', error.message);
        }
    }
}

module.exports = Email;
