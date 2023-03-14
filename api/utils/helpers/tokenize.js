const { sign, verify } = require('jsonwebtoken');
const { tokenizeStatus, decodeStatus } = require("./status.js");
const { logger: { error } } = require("./logger.js");
const { randomBytes } = require("crypto");

/**
 * generates a random string and uses it as a secret key and encodes the payload
 * @param { string | object | Buffer } payload can be a string or buffer or an object
 * @returns - { status: tokenizeStatus.SUCCESS, token: string, secret: string } if success
 * @returns - { status: tokenizeStatus.FAILURE } if failure
 */
const tokenize = (payload) => {
	try {
		// generating a random token.
		const randomToken = randomBytes(256).toString('hex');
		const payloadToken = sign(payload, randomToken);

		const token = encodeURI(payloadToken) + "_!" + randomToken;

		return ({
			status: tokenizeStatus.SUCCESS,
			token: token,
			secret: randomToken
		});
	}
	catch (err) {
		error('tokenizing error ' + err);
		return ({
			status: tokenizeStatus.FAILURE,
		});
	}
};


/**
 * It takes a token, splits it into two parts, verifies the first part with the second part, and
 * returns the result.
 * @param { string } token - The token to decode
 * @returns An object with a status and a payload.
 */
const decodeToken = (token) => {
	try {
		const splitToken = token.split("_!");

		if (splitToken.length !== 2)
			return ({
				status: decodeStatus.FAILURE,
			});

		const payload = verify(splitToken[0], splitToken[1]);

		return ({
			status: decodeStatus.SUCCESS,
			payload: payload,
			secret: splitToken[1]
		});
	}
	catch (err) {
		error('Decode token error: ' + err);
		return ({
			status: decodeStatus.FAILURE,
		});
	}
}

exports.tokenize = tokenize;
exports.decodeToken = decodeToken;