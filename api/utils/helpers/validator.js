const { validate } = require("email-validator");
const { IsValidOtpString } = require("./status.js");

/**
 * If the email address contains a character, followed by zero or more characters, followed by an @
 * symbol, followed by zero or more characters, followed by a period, followed by two or three
 * characters, then the email address is valid.
 * @param { string } email - The email address to validate.
 * @returns A boolean value.
 */
const emailValidator = (email) => {
	return validate(email.toLowerCase());
};

/**
 * The password must be at least 8 characters long, contain at least one lowercase letter, one
 * uppercase letter, one number, and one special character.
 * @param { string } password - The password to validate.
 * @returns A function that takes a password as an argument and returns true if the password is valid
 * and false if it is not.
 */
const passwordValidator = (password) => {
	const passwordRegex = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/);
	if (passwordRegex.test(password)) return true;
	return false;
};

/**
 * It returns true if the userId is between 7 and 15 characters long and doesn't contain any spaces.
 * @param { string } userId - The userId to validate.
 * @returns A function that takes a userId as a parameter and returns a boolean value.
 */
const userIdValidator = (userId) => {
	if (userId.includes(" ")) return false;
	else if (userId.length < 7 || userId.length > 15) return false;
	else return true;
};

/**
 * It takes a string and checks if it's a valid OTP
 * @param { string } otp - The OTP string to validate.
 * @param { number } length - The length of the OTP.
 * @returns An object with two properties: status and OTP.
 */
const validateOTP = (otp, length) => {
	const OTP = [];

	if (typeof otp === 'string') {
		for (const char of otp) {
			if (char === ' ') continue;
			else if (isNaN(parseInt(char))) return ({ status: IsValidOtpString.INVALID });
			else OTP.push(char);
		}

		if (OTP.length === length) {
			return ({
				status: IsValidOtpString.VALID,
				OTP: OTP.join(''),
			});
		}
		else return ({ status: IsValidOtpString.INVALID });
	}

	else return ({ status: IsValidOtpString.INVALID });
};

exports.validateEmail = emailValidator;
exports.validatePassword = passwordValidator;
exports.validateUserId = userIdValidator;
exports.validateOTP = validateOTP;
