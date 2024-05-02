// require express
const express = require("express");

// require express router
const router = express.Router();

// require shortner controller
const shortnerController = require("../controllers/shortnerController");

// require middleware
const isAuth = require("../middleware/isAuth");

// protected routes
router.get("/getAllUrls", isAuth, shortnerController.getAllUrls);
router.post("/shorten", isAuth, shortnerController.shorten);
router.get("/:shortId", shortnerController.redirect);

// export router
module.exports = router;
