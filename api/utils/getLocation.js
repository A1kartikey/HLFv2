require("dotenv").config();
const fetch = require("node-fetch");
const { logger } = require("./helpers/logger");

const apiKey = process.env.API_KEY;

const getLocation = async (address) => {
	try {
		const result = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`);
		const parse = await result.json();
		logger.info(parse.results[0].geometry.location);
		return {
			response: true,
			location: parse.results[0].geometry.location,
		};
	} catch (error) {
		logger.error(error.message);
		return {
			response: false,
		};
	}
};

module.exports = { getLocation };
