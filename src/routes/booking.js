const express = require("express");
const {
  getHotelsByLocation,
  getHotelDescription,
} = require("../controllers/booking");

const router = express.Router();

router.get("/hotelsbylocation", getHotelsByLocation);
router.get("/hotelDescription", getHotelDescription);
module.exports = router;
