const { returnErrorResponse } = require("../../utils/error-response-handler");


async function BusQuery(res, body) {
	const checkParam =
		"distance" in body &&
		body.distance &&
		(typeof body.distance === "number" || (typeof body.distance === "string" && !isNaN(parseFloat(body.distance)))) &&
		"busType" in body &&
		(body.busType === "local" || body.busType === "coach") &&
		"noOfPassengers" in body &&
		typeof body.noOfPassengers === "number" &&
		body.noOfPassengers > 0;
	if (checkParam) {
		let index;
		let distance = body.distance;
		if (typeof distance === "string") distance = parseFloat(distance);
		switch (body.busType) {
			case "local":
				index = 0.0965;
				break;
			case "coach":
				index = 0.02781;
				break;
			default:
				return returnErrorResponse(res, 500, "Internal Server Error");
		}
		return res.status(200).json({
			status: true,
			calculatedEmission: +(body.distance * body.noOfPassengers * index).toFixed(2),
		});
	} else return returnErrorResponse(res, 400, "Invalid or missing parameters for bus-type")
}

exports.BusQuery = BusQuery;
