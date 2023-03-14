const { createTransport } = require("nodemailer");
require('dotenv').config();
const { logger: { error } } = require("./helpers/logger.js");
const { emailSentStatus } = require("./helpers/status");

/**
 * takes in `to`, `subject` and the content of the email body `html`
 * @param {{
 *   userCredentials: {
 *     to: string,
 *     subject: string,
 *     html: string
 *   }
 * }} options object containing all the necessary user credentials
 * @returns emailSentStatus.SENT | emailSentStatus.NOT_SENT | emailSentStatus.UNKNOWN
 */
async function sendMail(options) {
	
	const transporter = createTransport({
        host: process.env.SMTP_HOST,
        secureConnection: false,
        port: 587,
        tls: { ciphers: 'SSLv3' },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

	const mailOptions = {
		from: process.env.EMAIL_FROM_ADDRESS,
		to: options.userCredentials.to,
		subject: options.userCredentials.subject,
		html: options.userCredentials.html,
	};

	try {
		const result = await transporter.sendMail(mailOptions);
		if (Array.isArray(result.accepted) && result.accepted.length !== 0) {
			return emailSentStatus.SENT;
		}
		else return emailSentStatus.NOT_SENT;
	}
	catch (err) {
		error('Send email error ' + err);
		return emailSentStatus.UNKNOWN;
	}
}

exports.sendMail = sendMail;