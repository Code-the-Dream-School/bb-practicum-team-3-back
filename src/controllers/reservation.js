const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const Reservation = require("../models/Reservation");

const getAllReservation = async (req, res) => {
  const reservation = await Reservation.find({
    createdBy: req.user.userId,
  });

  res.status(StatusCodes.OK).json({ data: reservation });
};

const createReservation = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const reservation = await Reservation.create(req.body);
  res.status(StatusCodes.CREATED).json({ data: reservation });
};

const getReservation = async (req, res) => {
  const {
    user: { userId },
    params: { id: reservationId },
  } = req;

  const reservation = await Reservation.findOne({
    _id: reservationId,
    createdBy: userId,
  });

  if (!reservation) {
    throw new NotFoundError(`No reservation with id: ${reservationId}`);
  }

  res.status(StatusCodes.OK).json({ data: reservation });
};

const deleteReservation = async (req, res) => {
  const {
    user: { userId },
    params: { id: reservationId },
  } = req;

  const reservation = await Reservation.findByIdAndRemove({
    _id: reservationId,
    createdBy: userId,
  });

  if (!reservation) {
    throw new NotFoundError(`No reservation with id: ${reservationId}`);
  }

  res.status(StatusCodes.OK).json({ msg: "Reservation Deleted" });
};

module.exports = {
  getAllReservation,
  createReservation,
  getReservation,
  deleteReservation,
};
