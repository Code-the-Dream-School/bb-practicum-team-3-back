const { StatusCodes } = require("http-status-codes");
const limiter = require("../utils/apiLimiter");
const {
  searchLocation,
  searchHotels,
  hotelReviews,
  hotelData,
  hotelPictures,
  hotelMapPreview,
  hotelRooms,
  hotel_facilities_list,
  countryCodes,
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

const getCountryCodes = async (req, res) => {
  try {
    const allCountryCodes = await countryCodes();

    res.status(StatusCodes.OK).json({ countries: allCountryCodes });
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
    const [reviews, countries] = await Promise.all([
      hotelReviews(hotelId),
      countryCodes(),
    ]);

    const countryCodeToName = countries.result.reduce((acc, country) => {
      acc[country.country] = country.name;
      return acc;
    }, {});

    reviews.result.forEach((review) => {
      review.author.countrycode = countryCodeToName[review.author.countrycode];
      review.countrycode = countryCodeToName[review.countrycode];
      review.date = review.date.split(" ")[0];
      review.average_score = Math.round(review.average_score);

      // Remove is_moderated and is_incentivised
      delete review.is_moderated;
      delete review.is_incentivised;

      // Only keep url_original in stayed_room_info.photo
      const urlOriginal = review.stayed_room_info.photo.url_original;
      review.stayed_room_info.photo = { url_original: urlOriginal };
    });

    res.status(StatusCodes.OK).json({ Reviews: reviews });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};

const getHotelFacilities = async (req, res) => {
  try {
    const allHoteFacilities = await hotel_facilities_list();

    res.status(StatusCodes.OK).json({ facilities: allHoteFacilities });
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
    const facilitiesResponse = await hotel_facilities_list();

    // Access the facilities array using facilitiesResponse.result
    const facilities = facilitiesResponse.result;

    // Create a map of facility IDs to facility names
    const facilityIdToName = facilities.reduce((acc, facility) => {
      acc[facility.hotel_facility_type_id] = facility.name;
      return acc;
    }, {});

    // Replace the facility IDs with facility names
    const replaceIdsWithNames = (ids) => {
      return ids
        .split(",")
        .map((id) => facilityIdToName[id])
        .join(",");
    };

    allHoteldata.hotel_facilities = replaceIdsWithNames(
      allHoteldata.hotel_facilities
    );
    allHoteldata.hotel_facilities_filtered = replaceIdsWithNames(
      allHoteldata.hotel_facilities_filtered
    );

    res.status(StatusCodes.OK).json({ FilteredHotelData: allHoteldata });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
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

    res.status(StatusCodes.OK).json({ Rooms: rooms });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error });
  }
};

/////// All of the functions using rate limiter
const hotelReviewsLimited = async (hotelId) => {
  return limiter.schedule(() => hotelReviews(hotelId));
};

const hotelDataLimited = async (hotelId) => {
  return limiter.schedule(() => hotelData(hotelId));
};

const hotelPicturesLimited = async (hotelId) => {
  return limiter.schedule(() => hotelPictures(hotelId));
};

const hotelMapPreviewLimited = async (hotelId) => {
  return limiter.schedule(() => hotelMapPreview(hotelId));
};

const countryCodesLimited = async () => {
  return limiter.schedule(() => countryCodes());
};

const hotel_facilities_listLimited = async () => {
  return limiter.schedule(() => hotel_facilities_list());
};
////////////////////

///// One single function to get all of the details, able to be used because of the rate limiter.
const allHotelDetails = async (req, res) => {
  let { hotelId } = req.query;

  if (!hotelId) {
    throw new Error("Hotel Id is required");
  }

  try {
    const [
      reviews,
      allHotelData,
      allHotelPictures,
      mapPreviewUrl,
      countries,
      facilitiesResponse,
    ] = await Promise.all([
      hotelReviewsLimited(hotelId),
      hotelDataLimited(hotelId),
      hotelPicturesLimited(hotelId),
      hotelMapPreviewLimited(hotelId),
      countryCodesLimited(),
      hotel_facilities_listLimited(),
    ]);

    // Process reviews response
    const countryCodeToName = countries.result.reduce((acc, country) => {
      acc[country.country] = country.name;
      return acc;
    }, {});

    reviews.result.forEach((review) => {
      review.author.countrycode = countryCodeToName[review.author.countrycode];
      review.countrycode = countryCodeToName[review.countrycode];
      review.date = review.date.split(" ")[0];
      review.average_score = Math.round(review.average_score);

      // Remove is_moderated and is_incentivised
      delete review.is_moderated;
      delete review.is_incentivised;

      // Only keep url_original in stayed_room_info.photo
      const urlOriginal = review.stayed_room_info.photo.url_original;
      review.stayed_room_info.photo = { url_original: urlOriginal };
    });

    // Process hotel data response
    const facilities = facilitiesResponse.result;

    const facilityIdToName = facilities.reduce((acc, facility) => {
      acc[facility.hotel_facility_type_id] = facility.name;
      return acc;
    }, {});

    const replaceIdsWithNames = (ids) => {
      return ids
        .split(",")
        .map((id) => facilityIdToName[id])
        .join(",");
    };

    allHotelData.hotel_facilities = replaceIdsWithNames(
      allHotelData.hotel_facilities
    );
    allHotelData.hotel_facilities_filtered = replaceIdsWithNames(
      allHotelData.hotel_facilities_filtered
    );

    // Combine all the responses
    const result = {
      HotelData: allHotelData,
      MapPreview: mapPreviewUrl,
      Photos: allHotelPictures,
      Reviews: reviews,
    };

    res.status(StatusCodes.OK).json(result);
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
  getHotelFacilities,
  getCountryCodes,
  allHotelDetails,
};
