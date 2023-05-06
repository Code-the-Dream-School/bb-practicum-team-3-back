const jwt = require("jsonwebtoken");

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = user.createJWT();
  const isProduction = process.env.NODE_ENV === "production";

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie(`${process.env.COOKIE_NAME}`, token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    signed: true,
    path: "/",
    sameSite: isProduction ? "None" : "Lax",
    secure: isProduction,
  });
};

module.exports = {
  isTokenValid,
  attachCookiesToResponse,
};
