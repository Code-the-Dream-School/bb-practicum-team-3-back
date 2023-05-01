const { Schema, Types, model } = require("mongoose");

const ReservationSchema = new Schema({
  checkin: {
    type: String,
    required: [true, "Please provide Checkin Date"],
  },
  checkout: {
    type: String,
    required: [true, "Please provide Checkout Date"],
  },
  total_days: {
    type: Number,
    required: [true, "Please provide Length of Stay"],
  },
  total_guests: {
    type: Number,
    required: [true, "Please provide Total Guest"],
  },
  total_rooms: {
    type: Number,
    required: [true, "Please provide Number of Rooms"],
  },
  total_price: {
    type: Number,
    required: [true, "Please provide Total Price"],
  },
  address: {
    type: String,
    required: [true, "Please provide Address"],
  },
  date_received: {
    type: String,
    required: [true, "Please provide Date Received"],
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "Please Provide User"],
  },
});

module.exports = model("Reservation", ReservationSchema);
