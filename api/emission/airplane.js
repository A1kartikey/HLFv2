const { getLocation } = require("../../utils/getLocation.js");
const haversine = require("haversine-distance");
const { returnErrorResponse } = require("../../utils/error-response-handler");

/**
 * Check for the body object and validate properties,
 * 
 * `Success`: status `200` { status: true, calculatedEmission: number }\
 * `Failure`: status `500` | `400` { status: false, message: string }
 * 
 * @param { Response } res express Response object
 * @param {{
 * 	from: string,
 *  to: string,
 *  tripType: 'oneWay' | 'round',
 *  flyingClass: 'economy' | 'business' | 'first' | 'premium',
 *  noOfPassengers: number
 * }} body 
 * @returns void
 */
async function AirplaneQuery(res, body) {
	const checkParam =
		"from" in body &&
		body.from &&
		"to" in body &&
		body.to &&
		"tripType" in body &&
		(body.tripType === "oneWay" || body.tripType === "round") &&
		"flyingClass" in body &&
		(body.flyingClass === "economy" || body.flyingClass === "business" || body.flyingClass === "first" || body.flyingClass === "premium") &&
		"noOfPassengers" in body &&
		typeof body.noOfPassengers === "number" &&
		body.noOfPassengers > 0;

	if (checkParam) {
		const fromLocation = await getLocation(body.from);
		const toLocation = await getLocation(body.to);
		if (fromLocation.response && toLocation.response) {
			let distanceMtr = haversine(fromLocation.location, toLocation.location) / 1000;
			let distance = Number(distanceMtr);
			if (body.tripType === "round") distance *= 2;
			let index;
			switch (body.flyingClass) {
				case "economy":
					index = 0.140625;
					break;
				case "premium":
					index = 0.225;
					break;
				case "business":
					index = 0.40781;
					break;
				case "first":
					index = 0.56251;
					break;
				default:
					return res.status(500).json({ status: false, message: "Internal Server Error" });
			}
			return res.send({
				status: true,
				calculatedEmission: +(distance * body.noOfPassengers * index).toFixed(2),
			});
		} 
		else return returnErrorResponse(res, 400, "Invalid location names");
	} 
	else
		return returnErrorResponse(res, 400, "Invalid or missing parameters for plane-type");
}

exports.AirplaneQuery = AirplaneQuery;
