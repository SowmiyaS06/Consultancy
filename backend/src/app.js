const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { getCorsOrigins } = require("./config/env");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = getCorsOrigins();

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) {
				return callback(null, true);
			}

			const normalizedOrigin = origin.replace(/\/$/, "");
			if (allowedOrigins.includes(normalizedOrigin)) {
				return callback(null, true);
			}

			return callback(new Error("CORS policy: Origin not allowed"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
