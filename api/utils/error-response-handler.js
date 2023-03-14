/**
 * It returns a response to the client with a status code and a message
 * @param { Response } res - The response object
 * @param { number } status - The HTTP status code you want to return.
 * @param { string } message - The message you want to send to the user.
 * @returns The function returnResponse is being returned.
 */
function returnErrorResponse(res, status, message) {
	return res.status(status).json({
		status: false,
		message: message
	});
}

exports.returnErrorResponse = returnErrorResponse;