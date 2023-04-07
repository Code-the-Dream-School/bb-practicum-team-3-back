const axios = require("axios");

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
    return error;
  }
};

const searchHotels = async (
  locationId,
  checkinDate,
  checkoutDate,
  guestNumber
) => {
  const currentDate = new Date();
  const nextDate = new Date(currentDate);

  nextDate.setDate(currentDate.getDate() + 1);
  const formattedCurrentDate = currentDate.toISOString().slice(0, 10);
  const formattedNextDate = nextDate.toISOString().slice(0, 10);

  if (checkinDate === "") {
    checkinDate = formattedCurrentDate;
  }

  if (checkoutDate === "") {
    checkoutDate = formattedNextDate;
  }

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
      dest_id: `${locationId}`,
      filter_by_currency: "USD",
      locale: "en-gb",
      room_number: "1",
    },
    headers: {
      "X-RapidAPI-Key": `${process.env.RapidAPI_Key}`,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    const filterResults = response.data.result.map((item) => ({
      hotel_id: item?.hotel_id,
      hotel_name: item?.hotel_name,
      photo_url: item?.max_photo_url,
      district: item?.district,
      city: item?.city,
      review_score: item?.review_score,
      review_score_word: item?.review_score_word,
      review_number: item?.review_nr,
      distance_to_cc: item?.distance_to_cc_formatted,
      gross_amount: item?.composite_price_breakdown?.gross_amount,
      is_free_cancellable: item?.is_free_cancellable,
      hotel_include_breakfast: item?.hotel_include_breakfast,
      has_swimming_pool: item?.has_swimming_pool,
      has_free_parking: item?.has_free_parking,
    }));

    return filterResults;
  } catch (error) {
    return error;
  }
};

module.exports = { searchLocation, searchHotels };
