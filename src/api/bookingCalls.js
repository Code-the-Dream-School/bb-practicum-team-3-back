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

const hotelDescription = async (hotelId) => {
  const options = {
    method: "GET",
    url: "https://booking-com.p.rapidapi.com/v1/hotels/description",
    params: { hotel_id: `${hotelId}`, locale: "en-gb" },
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
    console.log(error);
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

module.exports = {
  searchLocation,
  searchHotels,
  hotelDescription,
  hotelReviews,
  hotelData,
  hotelPictures,
  hotelMapPreview,
};
