const express = require("express");
const {
  getHotelsByLocation,
  getHotelDescription,
  getHotelReviews,
  getHotelData,
} = require("../controllers/booking");

const router = express.Router();

router.get("/hotelsbylocation", getHotelsByLocation);
router.get("/hoteldescription", getHotelDescription);
router.get("/hotelreviews", getHotelReviews);
router.get("/hoteldata", getHotelData);
module.exports = router;
