// require mongodb
const { MongoClient, ObjectId } = require("mongodb");

// require config
const { MONGO_URI, SECRET_KEY } = require("../utilities/config");

// require bcrypt
const bcrypt = require("bcrypt");

// require nodemailer
const nodemailer = require("nodemailer");

// require jsonwebtoken
const jwt = require("jsonwebtoken");

// connect to mongodb
const uri = new MongoClient(MONGO_URI);

// create userController object
const userController = {
  // Register new user
  register: async (req, res) => {
    try {
      await uri.connect();

      // connect db
      const DB = uri.db("URLShortner");
      const collection = DB.collection("users");

      // find user if already exists in db
      const user = await collection.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // insert user in db
      const newUser = await collection.insertOne({
        ...req.body,
        password: hashedPassword,
      });

      // check if user is inserted
      if (newUser.insertedId) {
        return res
          .status(201)
          .json({ message: "User registered successfully" });
      } else {
        return res.status(500).json({ message: "User registration failed" });
      }
    } catch (err) {
      return res.status(500).json(err.message);
    } finally {
      await uri.close();
    }
  },

  //   login user
  login: async (req, res) => {
    try {
      await uri.connect();

      // connect db
      const DB = uri.db("URLShortner");
      const collection = DB.collection("users");

      // find user in db
      const user = await collection.findOne({ email: req.body.email });

      // check if user exists
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // check if password is correct
      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Generate jwt token
      const jwtToken = jwt.sign(
        { id: user._id, email: user.email },
        SECRET_KEY,
        {
          expiresIn: "24h",
        }
      );

      // send jwt token in cookie
      res.cookie("token", jwtToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, //24 hours
        secure: true,
        sameSite: "none",
      });

      // store jwt token in localstorage
      // localStorage.setItem("token", jwtToken);

      return res
        .status(200)
        .json({ message: "User logged in successfully", token: jwtToken });
    } catch (err) {
      return res.status(500).json(err.message);
    } finally {
      await uri.close();
    }
  },

  //   logout user
  logout: (req, res) => {
    // clear cookie
    res.clearCookie("token");

    // clear localstorage
    // localStorage.removeItem("token");

    // send response
    return res.status(200).json({ message: "User logged out successfully" });
  },

  // forgot password
  forgotPassword: async (req, res) => {
    try {
      await uri.connect();

      // connect db
      const DB = uri.db("URLShortner");
      const collection = DB.collection("users");

      // find user in db
      const user = await collection.findOne({ email: req.body.email });

      // check if user exists
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Generate random string
      const randomString =
        Math.random().toString(36).substring(2, 5) +
        Math.random().toString(36).substring(2, 5);

      const expiresIn = Date.now() + 300000; // 5 minutes

      // send email to user
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "dinad9355@gmail.com",
          pass: "zvrmnumrpbmenvdr",
        },
      });

      // create message object
      const message = {
        from: "dinad9355@gmail.com",
        to: user.email,
        subject: "Password Reset",
        text: `Your password reset code is ${randomString}. This code will expire in 5 minutes.`,
      };

      // send email
      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error sending email" });
        }
      });

      // update password reset code in db
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetCode: randomString,
            passwordResetExpiresIn: expiresIn,
          },
        }
      );

      return res
        .status(200)
        .json({ message: "Password reset code sent to email" });
    } catch (err) {
      return res.status(500).json(err.message);
    } finally {
      await uri.close();
    }
  },

  // reset password
  resetPassword: async (req, res) => {
    try {
      await uri.connect();

      // connect db
      const DB = uri.db("URLShortner");
      const collection = DB.collection("users");

      // find reset token in db
      const resetToken = await collection.findOne({
        passwordResetCode: req.body.passwordResetCode,
        passwordResetExpiresIn: { $gt: Date.now() },
      });

      // check if user exists
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid token" });
      }
      // hash password
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

      // update password in db
      const isUpdated = await collection.updateOne(
        { _id: resetToken._id },
        {
          $set: {
            password: hashedPassword,
            passwordResetCode: null,
            passwordResetExpiresIn: null,
          },
        }
      );

      // check if password is updated
      if (isUpdated.modifiedCount > 0) {
        return res.status(200).json({ message: "Password reset successfully" });
      } else {
        return res.status(500).json({ message: "Password reset failed" });
      }
    } catch (err) {
      return res.status(500).json(err.message);
    } finally {
      await uri.close();
    }
  },

  // Get logged in user
  getCurrentUser: async (req, res) => {
    try {
      await uri.connect();

      // connect db
      const DB = uri.db("URLShortner");
      const collection = DB.collection("users");

      // find current logged user in db
      const currentUser = await collection.findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { _id: 1, name: 1, email: 1, location: 1 } }
      );

      return res.status(200).json(currentUser);
    } catch (err) {
      return res.status(500).json(err.message);
    } finally {
      await uri.close();
    }
  },
};

// export userController object
module.exports = userController;
