const express = require("express");
const {
  getHotelsByLocation,

  getHotelReviews,
  getHotelData,
  getHotelPictures,
  getHotelMap,
  getHotelRooms,
} = require("../controllers/booking");

const router = express.Router();

router
  .get("/hotelsbylocation", getHotelsByLocation)
  .get("/hotelreviews", getHotelReviews)
  .get("/hoteldata", getHotelData)
  .get("/hotelpictures", getHotelPictures)
  .get("/hotelmap", getHotelMap)
  .get("/hotelrooms", getHotelRooms);

module.exports = router;
