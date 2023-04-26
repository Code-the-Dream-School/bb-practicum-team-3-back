const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getUserToken,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/usertoken", getUserToken);

module.exports = router;
