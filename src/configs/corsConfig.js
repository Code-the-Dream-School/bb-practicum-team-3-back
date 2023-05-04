const allowedOrigins = [
  "http://localhost:3000",
  "https://stayfinder-api.onrender.com",
];

const options = {
  origin: allowedOrigins,
  credentials: true,
};
module.exports = options;
