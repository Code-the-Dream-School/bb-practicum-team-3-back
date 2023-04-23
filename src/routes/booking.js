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

router.get("/hotelsbylocation", getHotelsByLocation);
router.get("/hotelreviews", getHotelReviews);
router.get("/hoteldata", getHotelData);
router.get("/hotelpictures", getHotelPictures);
router.get("/hotelmap", getHotelMap);
router.get("/hotelrooms", getHotelRooms);

module.exports = router;
