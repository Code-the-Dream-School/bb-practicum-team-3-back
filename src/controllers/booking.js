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
  reviewScores,
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

///// this creates error messages if there are missing params for get hotel rooms
const getErrorMessages = ({ hotelId, guestNumber }) => {
  const errorMessages = [];

  if (!hotelId) {
    errorMessages.push("Hotel Id is required");
  }

  if (!guestNumber) {
    errorMessages.push("Number of guests is required");
  }

  return errorMessages.join(", ");
};

const getHotelRooms = async (req, res) => {
  let { hotelId, checkinDate, checkoutDate, guestNumber } = req.query;

  if (checkinDate === "null" || !checkinDate) {
    checkinDate = new Date().toISOString().slice(0, 10);
  }

  if (checkoutDate === "null" || !checkoutDate) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    checkoutDate = nextDate.toISOString().slice(0, 10);
  }

  const errorMessages = getErrorMessages({ hotelId, guestNumber });

  if (errorMessages.length > 0) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: errorMessages.join(", ") });
    return;
  }

  try {
    const rooms = await hotelRooms(
      hotelId,
      checkinDate,
      checkoutDate,
      guestNumber
    );

    res.status(StatusCodes.OK).json({ data: rooms });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

///// use the same thing as he did
// Rate-limited wrapper functions for API requests
// These functions use the Bottleneck rate limiter to ensure that API requests are made within the allowed limits
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

const reviewScoresLimited = async (hotelId) => {
  return limiter.schedule(() => reviewScores(hotelId));
};

const hotel_facilities_listLimited = async () => {
  return limiter.schedule(() => hotel_facilities_list());
};
///////////////////////////////////////////////////

// Unified function to retrieve all hotel details
// This function consolidates multiple API requests to collect a comprehensive set of information about a hotel.
// The rate-limited wrapper functions are used to ensure compliance with API request limits.
const allHotelDetails = async (req, res) => {
  let { hotelId } = req.query;

  if (!hotelId) {
    throw new Error("Hotel Id is required");
  }

  const processReviews = (reviews) => {
    const { count, result } = reviews;
    if (!result) return { count: 0, result: [] };
    ///// filtering out keys we don't need
    const processedResult = result.map((review) => {
      const {
        stayed_room_info,
        author,
        city,
        age_group,
        anonymous,
        is_trivial,
        tags,
        user_new_badges,
        review_hash,
        reviewng,
        pros_translated,
        cons_translated,
        is_incentivised,
        title_translated,
        languagecode,
        is_moderated,
        helpful_vote_count,
        hotelier_response_date,
        ...rest
      } = review;

      const { checkout, checkin, ...stayedRoomInfoRest } = stayed_room_info;

      const {
        nr_reviews,
        city: authorCity,
        age_group: author_age_group,
        helpful_vote_count: author_helpful_vote_count,
        ...authorRest
      } = author;

      return {
        ...rest,
        stayed_room_info: {
          ...stayedRoomInfoRest,
          photo: { url_original: stayed_room_info.photo.url_original },
          room_name: stayed_room_info.room_name,
          room_id: stayed_room_info.room_id,
          num_nights: stayed_room_info.num_nights,
        },
        author: {
          ...authorRest,
          user_id: author.user_id,
          type: author.type,
          name: author.name,
          countrycode: author.countrycode,
          helpful_vote_count: author.helpful_vote_count,
          avatar: author.avatar,
          type_string: author.type_string,
        },
      };
    });

    return {
      count,
      result: processedResult,
    };
  };
  ///// limited responses

  try {
    const [
      reviewsResponse,
      allHotelData,
      allHotelPictures,
      mapPreviewUrl,
      countries,
      facilitiesResponse,
      reviewScoresResponse,
    ] = await Promise.all([
      hotelReviewsLimited(hotelId),
      hotelDataLimited(hotelId),
      hotelPicturesLimited(hotelId),
      hotelMapPreviewLimited(hotelId),
      countryCodesLimited(),
      hotel_facilities_listLimited(),
      reviewScoresLimited(hotelId),
    ]);

    const countryCodeToName = countries.result.reduce((acc, country) => {
      acc[country.country] = country.name;
      return acc;
    }, {});
    // error handling if the hotel does not contain needed data.
    if (!allHotelData || allHotelData === "The hotel is not available.") {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "The hotel is not available." });
      return;
    }

    // Process reviews response
    const reviews = processReviews(reviewsResponse);

    reviews.result.forEach((review) => {
      review.author.countrycode = countryCodeToName[review.author.countrycode];
      review.countrycode = countryCodeToName[review.countrycode];
      review.date = review.date.split(" ")[0];
      review.average_score = Math.round(review.average_score);
    });

    // Process reviewScores response
    const processReviewScores = (scores) => {
      if (!scores) return {};

      const processedScores = {};

      scores.score_breakdown.forEach(
        ({ average_score, customer_type, question }) => {
          question.forEach(({ score, localized_question }) => {
            // Replace spaces with underscores and append "_score" to the key
            const key =
              localized_question.replace(/\s+/g, "_").toLowerCase() + "_score";
            processedScores[key] = Math.round(score);
          });
        }
      );

      return processedScores;
    };
    const processedReviewScores = processReviewScores(reviewScoresResponse);

    // Process hotel data response
    const facilities = facilitiesResponse.result;

    const facilityIdToName = facilities.reduce((acc, facility) => {
      acc[facility.hotel_facility_type_id] = facility.name;
      return acc;
    }, {});

    const replaceIdsWithNames = (ids) => {
      if (!ids) return [];
      return ids
        .split(",")
        .map((id) => facilityIdToName[id])
        .filter((facility) => facility); // Filter out empty values
    };

    allHotelData.hotel_facilities = replaceIdsWithNames(
      allHotelData.hotel_facilities
    );
    delete allHotelData.hotel_facilities_filtered; // Remove hotel_facilities_filtered

    // Remove language code from hotel_description_translations
    allHotelData.description_translations =
      allHotelData.description_translations.map(
        ({ languagecode, ...rest }) => rest
      );

    // Combine all the responses
    const result = {
      hotel_data: allHotelData,
      map_preview: mapPreviewUrl,
      photos: allHotelPictures,
      review_scores: processedReviewScores,
      reviews: reviews,
    };
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

///// exports /////
module.exports = {
  getHotelsByLocation,
  getHotelRooms,
  allHotelDetails,
};
