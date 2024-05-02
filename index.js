// require app from app.js
const app = require("./app");

// require config
const { PORT, MONGO_URI } = require("./utilities/config");

// require mongodb
const { MongoClient } = require("mongodb");

// connect to mongodb
const uri = new MongoClient(MONGO_URI);

// Function to connect mongodb database
const connectToDatabase = async () => {
  try {
    await uri.connect();
    console.log("Connected to database");

    // start server
    app.listen(PORT, () => console.log("Server started on port 3000"));
  } catch (error) {
    console.log(error);
  }
};

// call the function
connectToDatabase();
