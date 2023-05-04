const allowedOrigins = [
  "http://localhost:3000",
  "https://stayfinder.onrender.com/",
];

const options = {
  origin: allowedOrigins,
  credentials: true,
};
module.exports = options;
