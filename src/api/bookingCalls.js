const axios = require("axios");
const isIncluded = require("../utils/isIncluded");

const searchLocation = async (destination) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/locations",
    params: { name: `${destination}`, locale: "en-gb" },
    headers: {
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data[0].dest_id;
  } catch (error) {
    throw new Error("Unable to fetch location");
  }
};

const searchHotels = async (
  destinationName,
  destinationId,
  guestNumber,
  roomNumber,
  checkinDate,
  checkoutDate
) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/search",
    params: {
      checkin_date: `${checkinDate}`,
      dest_type: "city",
      units: "imperial",
      checkout_date: `${checkoutDate}`,
      adults_number: `${guestNumber}`,
      order_by: "popularity",
      dest_id: `${destinationId}`,
      filter_by_currency: "USD",
      locale: "en-gb",
      room_number: `${roomNumber}`,
    },
    headers: {
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    const filterResults = response.data.result.map((item) => ({
      id: item.hotel_id,
      name: item.hotel_name,
      image_url: item.max_photo_url,
      district: item.district,
      city: item.city,
      review_score: item.review_score,
      review_score_word: item.review_score_word,
      review_number: item.review_nr,
      distance: item.distance_to_cc_formatted,
      price: Math.ceil(item.composite_price_breakdown?.gross_amount.value),
      is_free_cancellable: isIncluded(item.is_free_cancellable),
      hotel_include_breakfast: isIncluded(item.hotel_include_breakfast),
      has_swimming_pool: isIncluded(item.has_swimming_pool),
      has_free_parking: isIncluded(item.has_free_parking),
    }));

    const data = {
      destinationName: destinationName,
      count: response.data.count,
      results: filterResults,
    };

    return data;
  } catch (error) {
    throw new Error("Unable to fetch hotels");
  }
};
//// list of all of the country codes
const countryCodes = async () => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/static/country",
    headers: {
      "content-type": "application/octet-stream",
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
  }
};
//// top 25 most relevant reviews
const hotelReviews = async (hotelId) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/reviews",
    params: {
      sort_type: "SORT_MOST_RELEVANT",
      hotel_id: `${hotelId}`,
      locale: "en-gb",
      language_filter: "en-gb,de,fr",
    },
    headers: {
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const reviewScores = async (hotelId) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/review-scores",
    params: {
      hotel_id: `${hotelId}`,
      locale: "en-gb",
    },
    headers: {
      "content-type": "application/octet-stream",
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Error fetching review scores for hotelId: ${hotelId}`);
  }
};

/// list of all of the hotel facilities with hotel facility type ID and the actual name.
const hotel_facilities_list = async () => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/static/hotel-facility-types",
    headers: {
      "content-type": "application/octet-stream",
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
  }
};
//// basic hotel info
const hotelData = async (hotelId) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/data",
    params: { hotel_id: `${hotelId}`, locale: "en-gb" },
    headers: {
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);

    ////// if the hotel does not have description_translations then the hotel will not be available.
    if (!response.data.hasOwnProperty("description_translations")) {
      throw new Error("The hotel is not available.");
    }

    const filteredHotelData = {};

    for (const key in response.data) {
      if (
        key === "review_score" ||
        key === "hotel_facilities" ||
        key === "address" ||
        key === "zip" ||
        key === "name" ||
        key === "description" ||
        key === "description_translations" ||
        key === "review_score_word" ||
        key === "main_photo_id" ||
        key === "hotel_facilities_filtered" ||
        key === "city" ||
        key === "hotel_id" ||
        key === "country"
      ) {
        filteredHotelData[key] = response.data[key];
      }
    }

    return filteredHotelData;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const hotelPictures = async (hotelId) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/photos",
    params: { hotel_id: `${hotelId}`, locale: "en-gb" },
    headers: {
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);

    /// filtering the large object to only include the max_url and photo_id
    const filteredPhotos = response.data.map((photo) => {
      const { photo_id, url_max } = photo;
      return { photo_id, url_max };
    });

    return filteredPhotos;
  } catch (error) {
    console.log(error);
  }
};

const hotelMapPreview = async (hotelId) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/map-markers",
    params: { hotel_id: `${hotelId}`, locale: "en-gb" },
    headers: {
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const { map_preview_url } = response.data;
    /// only returns the map_preview_url
    return { map_preview_url };
  } catch (error) {
    console.log(error);
  }
};
///// available rooms based on req.params
const hotelRooms = async (hotelId, checkinDate, checkoutDate, adultNumber) => {
  const axios = require("axios");

  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/room-list",
    params: {
      hotel_id: `${hotelId}`,
      currency: "AED",
      checkout_date: `${checkoutDate}`,
      locale: "en-gb",
      checkin_date: `${checkinDate}`,
      adults_number_by_rooms: `${adultNumber}`,
      units: "metric",
    },
    headers: {
      "content-type": "application/octet-stream",
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const { data } = response;

    const { block, rooms } = data[0];

    const roomsList = block.map((blockItem) => {
      const { min_price, room_name, block_id } = blockItem;
      const roomId = block_id.split("_")[0];
      const roomData = rooms[roomId];

      return {
        room_type: room_name,
        room_id: roomId,
        bedType: roomData.bed_configurations[0].bed_types
          .map((bed) => bed.name_with_count)
          .join(", "),
        sleeps: adultNumber,
        price: parseFloat(min_price.price),
        amenities: roomData.facilities.map((facility) => facility.name),
      };
    });

    const checkinDateObj = new Date(checkinDate);
    const checkoutDateObj = new Date(checkoutDate);
    const daysOfStay = Math.floor(
      (checkoutDateObj - checkinDateObj) / (1000 * 60 * 60 * 24)
    );

    return {
      checkinDate,
      checkoutDate,
      daysOfStay,
      rooms: roomsList,
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
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
};
