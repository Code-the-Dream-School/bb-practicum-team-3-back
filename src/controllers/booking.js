const { StatusCodes } = require("http-status-codes");
const { searchLocation, searchHotels } = require("../api/bookingCalls");

const getHotelsByLocation = async (req, res) => {
  const { destination, checkinDate, checkoutDate, guestNumber } = req.body;

  try {
    const locationId = await searchLocation(destination);

    const hotels = await searchHotels(
      locationId,
      checkinDate,
      checkoutDate,
      guestNumber
    );

    res.status(StatusCodes.OK).json(hotels);
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json(error);
  }
};

module.exports = { getHotelsByLocation };
