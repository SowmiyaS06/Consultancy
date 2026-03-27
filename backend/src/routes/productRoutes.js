const express = require("express");
const { listProducts } = require("../controllers/storeController");

const router = express.Router();

router.get("/", listProducts);

module.exports = router;
