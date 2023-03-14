require("dotenv").config();
const fetch = require("node-fetch");
const { logger } = require("./helpers/logger");

const apiKey = process.env.API_KEY;

const getDist = async (origin, destination) => {
	try {
		const result = await fetch(
			`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=metric&key=${apiKey}`
		);
		const parse = await result.json();
		if (parse.rows[0].elements[0].status === "ZERO_RESULTS") {
			throw new Error(undefined);
		}
		logger.info(parse.rows[0].elements[0].distance.text);
		return {
			response: true,
			location: parse.rows[0].elements[0].distance.value / 1000,
		};
	} catch (error) {
		logger.error(error);
		return {
			response: false,
		};
	}
};

module.exports = { getDist };
