const { getLocation } = require("../../utils/getLocation.js");
const { getDist } = require("../../utils/getDistance.js");

const { returnErrorResponse } = require("../../utils/error-response-handler");


/**
 * Check for the body object and validate properties,
 *
 * `Success`: status `200` { status: true, calculatedEmission: number }\
 * `Failure`: status `500` | `400` { status: false, message: string }
 * @param { Response } res express response object
 * @param {{
 *  from: string,
 *  to: string,
 *  carType?: 'small' | 'medium' | 'large' | 'average',
 *  fuelType: 'petrol' | 'diesel' | 'cng'
 * }} body
 * @returns void
 */
async function CarQuery(res, body) {
	const checkParam =
		"from" in body &&
		body.from &&
		"to" in body &&
		body.to && // check if bikeType is present, if present check for value,
		// if not present, consider default value average
		(("carType" in body && (body.carType === "small" || body.carType === "medium" || body.carType === "large" || body.carType === "average")) ||
			!("carType" in body)) &&
		"fuelType" in body &&
		(body.fuelType === "petrol" || body.fuelType === "diesel" || body.fuelType === "cng");

	if (checkParam) {
		const fromLocation = await getLocation(body.from);
		const toLocation = await getLocation(body.to);
		if (fromLocation.response && toLocation.response) {
			const distance = await getDist(body.from, body.to);
			if (distance.response) {
				let index;
				switch (body.carType) {
					case "small":
						index = body.fuelType === "petrol" ? 0.14652 : 0.13989414;
						break;
					case "medium":
						index = body.fuelType === "petrol" ? 0.1847 : body.fuelType === "diesel" ? 0.16800414 : 0.15803;
						break;
					case "large":
						index = body.fuelType === "petrol" ? 0.27639 : body.fuelType === "diesel" ? 0.20953414 : 0.23578;
						break;
					case "average":
					case undefined:
					case null:
						index = body.fuelType === "petrol" ? 0.17048 : body.fuelType === "diesel" ? 0.17082414 : 0.17517;
						break;
					default:
						return returnErrorResponse(res, 500, "Internal Server Error");
				}
				return res.send({
					status: true,
					calculatedEmission: +(distance.location * index).toFixed(2),
				});
			} else
				return returnErrorResponse(res, 500, 'No route found');
		} else return returnErrorResponse(res, 400, 'Invalid location names');
	} else
		return returnErrorResponse(res, 400, 'Invalid or missing parameters for car-type');
}

exports.CarQuery = CarQuery;
