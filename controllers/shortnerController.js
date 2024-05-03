// require mongodb
const { MongoClient } = require("mongodb");

// require config
const { MONGO_URI, SECRET_KEY } = require("../utilities/config");

// require jsonwebtoken
const jwt = require("jsonwebtoken");

// connect to mongodb
const uri = new MongoClient(MONGO_URI);

// create shortner object
const shortner = {
  // shorten url
  shorten: async (req, res) => {
    try {
      const { longUrl } = req.body;

      // check if url is valid
      const urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // Protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // Domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IP (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // Port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // Query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );

      const isValidUrl = urlPattern.test(longUrl);
      if (!isValidUrl) {
        return res.status(400).json({ message: "Invalid url" });
      }

      //   Generate random string
      const subId = (Math.random() + 1).toString(36).substring(2);

      // create short url
      // const shortURL = `${req.protocol}://${req.get("host")}/${subId}`;
      const shortURL = `https://shortener/${subId}`;

      // create insert object
      const url = {
        longUrl,
        shortUrl: shortURL,
        createdAt: new Date(),
        createdBy: req.user.id,
        clicked: 0,
      };

      // connect to mongodb
      await uri.connect();

      // selecting database
      const DB = uri.db("URLShortner");
      const collection = DB.collection("shorteninfo");

      // insert short url in database
      const isInserted = await collection.insertOne(url);

      // check if url is inserted
      if (!isInserted.insertedId) {
        return res.status(500).json({ message: "Failed to insert data" });
      }
      return res.status(200).json({ message: shortURL });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    } finally {
      await uri.close();
    }
  },

  //   redirect to longurl
  redirect: async (req, res) => {
    try {
      const { shortId } = req.params;

      //   convert short url to base64
      const shortURL = `${req.protocol}://${req.get("host")}/${shortId}`;

      // connect to mongodb
      await uri.connect();

      // selecting database
      const DB = uri.db("URLShortner");
      const collection = DB.collection("shorteninfo");

      //   find url in database
      const url = await collection.findOne({ shortUrl: shortURL });

      //   check if url is found
      if (!url) {
        return res.status(404).json({ message: "Url not found" });
      }

      //   update url clicked count
      await collection.updateOne(
        { shortUrl: shortURL },
        { $inc: { clicked: 1 } }
      );

      // return redirect to original url
      return res.redirect(url.longUrl);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    } finally {
      await uri.close();
    }
  },

  //   get all shorten url for logged in user
  getAllUrls: async (req, res) => {
    try {
      // connect to mongodb
      await uri.connect();

      // selecting database
      const DB = uri.db("URLShortner");
      const collection = DB.collection("shorteninfo");

      // find all shorten url for logged in user
      const data = await collection.find({ createdBy: req.user.id }).toArray();

      //   check if data is found
      if (data.length) {
        return res.status(200).json(data);
      }
      return res.status(404).json({ message: "No data found" });
      
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    } finally {
      await uri.close();
    }
  },
};

// export shortner object
module.exports = shortner;
