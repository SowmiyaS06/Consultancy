const errorHandler = (err, _req, res, _next) => {
  if (err && err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value not allowed" });
  }
  const status = err.statusCode || 500;
  return res.status(status).json({ message: err.message || "Server error" });
};

module.exports = { errorHandler };
