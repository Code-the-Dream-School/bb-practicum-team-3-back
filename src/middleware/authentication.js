const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const authentication = async (req, res, next) => {
  const token = req.signedCookies[process.env.COOKIE_NAME];

  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

module.exports = authentication;
