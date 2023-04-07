const jwt = require("jsonwebtoken");

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = user.createJWT();

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie(`${process.env.COOKIE_NAME}`, token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = {
  isTokenValid,
  attachCookiesToResponse,
};
