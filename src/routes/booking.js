const express = require("express");
const {
  getHotelsByLocation,
  getHotelRooms,
  allHotelDetails,
} = require("../controllers/booking");

const router = express.Router();

router
  .get("/hotelsbylocation", getHotelsByLocation)
  .get("/hotelrooms", getHotelRooms)
  .get("/all-hotel-details", allHotelDetails);
module.exports = router;
