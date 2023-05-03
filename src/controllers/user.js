const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const User = require("../models/User");

const getUserInfo = async (req, res) => {
  const {
    user: { userId },
  } = req;

  const user = await User.findOne({
    _id: userId,
  });

  if (!user) {
    throw new NotFoundError(`No user with id: ${userId}`);
  }

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  res.status(StatusCodes.OK).json({ user: userData });
};

module.exports = {
  getUserInfo,
};
