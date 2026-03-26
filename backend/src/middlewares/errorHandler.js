const errorHandler = (err, _req, res, _next) => {
  if (err && /CORS policy/i.test(err.message || "")) {
    return res.status(403).json({ message: "Request blocked by CORS policy" });
  }

  if (err && err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value not allowed" });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const status = err.statusCode || 500;
  return res.status(status).json({
    message: err.message || "Server error",
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = { errorHandler };
