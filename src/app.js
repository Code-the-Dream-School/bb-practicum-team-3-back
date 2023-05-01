require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const favicon = require("express-favicon");
const logger = require("morgan");
const connectDB = require("./db/connect");
const corsOptions = require("./configs/corsConfig");
const authenticateUser = require("./middleware/authentication");

///express json
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// middleware
app.use(cors(corsOptions));
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
const bookingRouter = require("./routes/booking");
const reservationRouter = require("./routes/reservation");

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/reservations", authenticateUser, reservationRouter);

/// set up port
const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(
      port,
      console.log(`Server is running at http://localhost:${port}`)
    );
  } catch (error) {}
};

start();
