const express = require("express");
const {
  getHotelsByLocation,
  getHotelDescription,
  getHotelReviews,
} = require("../controllers/booking");

const router = express.Router();

router.get("/hotelsbylocation", getHotelsByLocation);
router.get("/hoteldescription", getHotelDescription);
router.get("/hotelreviews", getHotelReviews);

module.exports = router;
