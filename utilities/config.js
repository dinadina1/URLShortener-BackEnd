// require dotenv
require('dotenv').config();

// create configuration object
const config = {
    PORT : process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    SECRET_KEY: process.env.SECRET_KEY
}

// export config object
module.exports = config;