require("dotenv").config();
const winston = require("winston");
const { combine, timestamp, prettyPrint, json } = winston.format;

let logger;
if (process.env.NODE_ENV === "production") {
	logger = new winston.createLogger({
		level: "info",
		format: combine(timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }), json()),
		defaultMeta: { service: "user-service" },
		transports: [
			new winston.transports.Console(),
			new winston.transports.File({ filename: "error.log", level: "error" }),
			new winston.transports.File({ filename: "combined.log" }),
		],
	});
} else if (process.env.NODE_ENV === "development") {
	logger = new winston.createLogger({
		level: "info",
		format: combine(timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }), prettyPrint()),
		transports: [new winston.transports.Console()],
	});
}

exports.logger = logger;
