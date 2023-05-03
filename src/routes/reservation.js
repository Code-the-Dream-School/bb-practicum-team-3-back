const express = require("express");
const {
  getAllReservation,
  createReservation,
  getReservation,
  deleteReservation,
} = require("../controllers/reservation");

const router = express.Router();

router.route("/").post(createReservation).get(getAllReservation);

router.route("/:id").get(getReservation).delete(deleteReservation);

module.exports = router;
