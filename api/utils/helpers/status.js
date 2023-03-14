const emailVerificationStatus = {
	VERIFIED: 0X000ED,
	NOT_VERIFIED: 0X0E500,
	UNKNOWN: 0X0000
}

const emailSentStatus = {
	SENT: 0XAAAA,
	NOT_SENT: 0XBBBB,
	UNKNOWN: 0X0000,
};

const tokenizeStatus = {
	SUCCESS: 0XEEEE,
	FAILURE: 0XDDDD,
	UNKNOWN: 0X0000
};

const decodeStatus = {
	SUCCESS: 0XAAAA,
	FAILURE: 0XBBBB,
	UNKNOWN: 0X0000
};

const OTPValidityStatus = {
	VALID: 0X8787,
	EXPIRED: 0X6666,
	UNKNOWN: 0X0000,
};

const setDateStatus = {
	TRUE: 0X0444,
	FALSE: 0X0033,
}

const IsValidOtpString = {
	VALID: 0X0389,
	INVALID: 0X0660,
}

const apiGenStatus = {
	SUCCESS: 0X5678,
	FAILURE: 0X3456,
}

exports.emailVerificationStatus = emailVerificationStatus;
exports.emailSentStatus = emailSentStatus;
exports.tokenizeStatus = tokenizeStatus;
exports.decodeStatus = decodeStatus;
exports.OTPValidityStatus = OTPValidityStatus;
exports.setDateStatus = setDateStatus;
exports.IsValidOtpString = IsValidOtpString;
exports.apiGenStatus = apiGenStatus;