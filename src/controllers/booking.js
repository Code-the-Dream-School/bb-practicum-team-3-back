const { StatusCodes } = require("http-status-codes");
const {
  searchLocation,
  searchHotels,
  hotelReviews,
  hotelData,
  hotelPictures,
  hotelMapPreview,
  hotelRooms,
} = require("../api/bookingCalls");

const getHotelsByLocation = async (req, res) => {
  let { destination, guestNumber, roomNumber, checkinDate, checkoutDate } =
    req.query;

  if (!destination) {
    throw new Error("Destination is required");
  }

  if (!guestNumber) {
    throw new Error("Guest Number is required");
  }

  if (!roomNumber) {
    throw new Error("Room Number is required");
  }

  if (checkinDate === "null") {
    checkinDate = new Date().toISOString().slice(0, 10);
  }

  if (checkoutDate === "null") {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    checkoutDate = nextDate.toISOString().slice(0, 10);
  }
  console.log(checkinDate);

  try {
    const locationId = await searchLocation(destination);

    const hotels = await searchHotels(
      destination,
      locationId,
      guestNumber,
      roomNumber,
      checkinDate,
      checkoutDate
    );

    res.status(StatusCodes.OK).json({ data: hotels });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};

const getHotelReviews = async (req, res) => {
  let { hotelId } = req.query;

  if (!hotelId) {
    throw new Error("Hotel Id is required");
  }
  try {
    const reviews = await hotelReviews(hotelId);

    res.status(StatusCodes.OK).json({ data: reviews });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};

const getHotelData = async (req, res) => {
  let { hotelId } = req.query;

  if (!hotelId) {
    throw new Error("Hotel Id is required");
  }

  try {
    const allHoteldata = await hotelData(hotelId);

    res.status(StatusCodes.OK).json({ FilteredHotelData: allHoteldata });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};

const getHotelPictures = async (req, res) => {
  let { hotelId } = req.query;

  if (!hotelId) {
    throw new Error("Hotel Id is required");
  }

  try {
    const allHotePictures = await hotelPictures(hotelId);

    res.status(StatusCodes.OK).json({ filteredPhotos: allHotePictures });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};

const getHotelMap = async (req, res) => {
  let { hotelId } = req.query;

  if (!hotelId) {
    throw new Error("Hotel Id is required");
  }

  try {
    const mapPreviewUrl = await hotelMapPreview(hotelId);

    res.status(StatusCodes.OK).json({ mapPreview: mapPreviewUrl });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};
///// this creates error messages if there are missing params
const getErrorMessages = ({
  hotelId,
  checkinDate,
  checkoutDate,
  adultNumber,
}) => {
  const errorMessages = [];

  if (!hotelId) {
    errorMessages.push("Hotel Id is required");
  }

  if (!checkinDate) {
    errorMessages.push("Checkin date is required");
  }

  if (!checkoutDate) {
    errorMessages.push("Checkout date is required");
  }

  if (!adultNumber) {
    errorMessages.push("Number of adults is required");
  }

  return errorMessages.join(", ");
};

const getHotelRooms = async (req, res) => {
  let { hotelId, checkinDate, checkoutDate, adultNumber } = req.query;

  const errorMessages = getErrorMessages({
    hotelId,
    checkinDate,
    checkoutDate,
    adultNumber,
  });
  if (errorMessages) {
    throw new Error(errorMessages);
  }

  try {
    const rooms = await hotelRooms(
      hotelId,
      checkinDate,
      checkoutDate,
      adultNumber
    );

    res.status(StatusCodes.OK).json({ data: rooms });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};

///// exports /////
module.exports = {
  getHotelsByLocation,
  getHotelReviews,
  getHotelData,
  getHotelPictures,
  getHotelMap,
  getHotelRooms,
};
