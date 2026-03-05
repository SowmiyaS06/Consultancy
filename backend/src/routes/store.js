const express = require("express");
const { listProducts, listOffers } = require("../controllers/storeController");

const router = express.Router();

router.get("/products", listProducts);
router.get("/offers", listOffers);

module.exports = router;
