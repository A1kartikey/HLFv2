const { randomBytes } = require("crypto");

function genRandomAPIKey() {
	const rand = randomBytes(50);

	let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".repeat(5);

	let str = '';

	for(let i=0; i < rand.length; i++){
		let decimal = rand[i];
		str += chars[decimal];
	}
	return str;
};

exports.genRandomAPIKey = genRandomAPIKey;