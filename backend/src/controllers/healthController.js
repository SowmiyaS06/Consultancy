const getHealth = (_req, res) => {
  res.status(200).json({ status: "ok", service: "vel-super-market" });
};

module.exports = { getHealth };
