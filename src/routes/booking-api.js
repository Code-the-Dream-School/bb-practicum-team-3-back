const express = require("express");
const { getHotelsByLocation } = require("../controllers/booking-api");

const router = express.Router();

router.get("/hotelsbylocation", getHotelsByLocation);

module.exports = router;
