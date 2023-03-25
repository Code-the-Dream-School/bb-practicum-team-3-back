require("dotenv").config({ path: "src/.env" });
require("express-async-errors");

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const favicon = require("express-favicon");
const logger = require("morgan");
const connectDB = require("./db/connect");

///express json
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));

app.get("/", (req, res) => {
  res.send("stayfinder");
});

// routes
const authRouter = require("./routes/auth");

app.use("/api/v1/auth", authRouter);

/// set up port
const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
