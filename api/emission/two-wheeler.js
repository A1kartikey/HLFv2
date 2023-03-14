const { getLocation } = require("../../utils/getLocation.js");
const { getDist } = require("../../utils/getDistance.js");

const { returnErrorResponse } = require("../../utils/error-response-handler.js");

async function TwoWheelerQuery(res, body) {
	const checkParam =
		"from" in body &&
		body.from &&
		"to" in body &&
		body.to && // check if bikeType is present, if present check for value,
		// if not present, consider default value average
		(("bikeType" in body && (body.bikeType === "small" || body.bikeType === "medium" || body.bikeType === "large" || body.bikeType === "average")) ||
			!("bikeType" in body));
	if (checkParam) {
		const fromLocation = await getLocation(body.from);
		const toLocation = await getLocation(body.to);
		if (fromLocation.response && toLocation.response) {
			const distance = await getDist(body.from, body.to);
			if (distance.response) {
				let index;
				switch (body.bikeType) {
					case "small":
						index = 0.08306;
						break;
					case "medium":
						index = 0.1009;
						break;
					case "large":
						index = 0.13245;
						break;
					case "average":
					case undefined:
					case null:
						index = 0.11355;
						break;
					default:
						return returnErrorResponse(res, 500, "Internal Server Error");
				}
	
				return res.send({
					status: true,
					calculatedEmission: +(distance.location * index).toFixed(2),
				});
			}
			else 
				return returnErrorResponse(res, 400, "No route Found");
		} else
			return returnErrorResponse(res, 400, "Invalid Location Names");
	} else
		return returnErrorResponse(res, 400, "Invalid or missing parameters for bike-type");
}

exports.TwoWheelerQuery = TwoWheelerQuery;
