// require express
const express = require("express");

// create express instance
const app = express();

// require cookie-parser
const cookieParser = require("cookie-parser");

// require bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// use cookie-parser
app.use(cookieParser());

// express router
app.use("/", require("./routes/user"));

app.use("/", require("./routes/urlShortner"));

// export app
module.exports = app;