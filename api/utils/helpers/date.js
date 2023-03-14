const { logger: { error } } = require("./logger.js");
const { setDateStatus } = require("./status.js");

const addDays = (numberOfDays) => {
	try {
		const today = new Date();

		if (typeof numberOfDays === 'string') {
			if (isNaN(parseInt(numberOfDays)))
				return ({
					status: setDateStatus.FALSE,
				});

			numberOfDays = parseInt(numberOfDays);
		}

		const newDate = today.setDate(today.getDate() + numberOfDays);

		return ({
			status: setDateStatus.TRUE,
			newDate,
		});
	}
	catch (err) {
		error("Error in setting date: " + err);
		return ({
			status: setDateStatus.FALSE,
		});
	}
}

exports.addDays = addDays;