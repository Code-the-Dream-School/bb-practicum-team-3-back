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
      return "The hotel is not available.";
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
    const { data } = response; // extract the 'data' object from the response

    const { block, rooms, room_recommendation } = data[0]; // extract the required fields from the first object of the 'data' array

    const filteredBlock = block.map(({ min_price, room_name, block_id }) => ({
      min_price: { currency: min_price.currency, price: min_price.price }, /// excludes the large "extra_charges_breakdown" object
      room_name,
      id: block_id,
    })); // create a new array with only the required fields for each object in the 'block' array

    const roomKeys = Object.keys(rooms);
    const filteredRooms = {};
    for (const key of roomKeys) {
      const { photos, ...roomData } = rooms[key];
      filteredRooms[key] = {
        ...roomData,
        photos: photos.map(({ url_original }) => ({ url_original })),
      };
    }
    return { block: filteredBlock, rooms: filteredRooms, room_recommendation };
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
};
