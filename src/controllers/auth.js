const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

/// REGISTER
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      throw new BadRequestError("Email already exists");
    }

    const user = await User.create({ firstName, lastName, email, password });

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user });

    res.status(StatusCodes.CREATED).json({ user: tokenUser });
  } catch (error) {
    next(error);
  }
};

/// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthenticatedError("Invalid Credentials");
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid Credentials");
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user });

    res.status(StatusCodes.OK).json({ user: tokenUser });
  } catch (error) {
    next(error);
  }
};

/// LOGOUT
const logout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(`${process.env.COOKIE_NAME}`, "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      signed: true,
      path: "/",
      sameSite: "none",
      secure: isProduction, // Set 'secure' dynamically based on the environment
    });

    res.status(StatusCodes.OK).json({ msg: "user logged out" });
  } catch (error) {
    next(error);
  }
};

const getUserToken = async (req, res) => {
  const token = req.signedCookies[process.env.COOKIE_NAME];

  if (token) {
    res.status(StatusCodes.OK).json({ token: token });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Token does not exist" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getUserToken,
};
