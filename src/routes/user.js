const express = require("express");
const { getUserInfo } = require("../controllers/user");

const router = express.Router();

router.route("/").get(getUserInfo);

module.exports = router;
