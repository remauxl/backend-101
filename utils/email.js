const nodemailer =  require("nodemailer");

const sendEmail = async options => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PASSWORD,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define the email options
    const mailOptions = {
        from:'Yasin <yasin@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.text
    }
    secure: false

    // Send it to the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;