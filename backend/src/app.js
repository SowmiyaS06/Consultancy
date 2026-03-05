const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
	: true;

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	}),
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
