// require express
const express = require('express');

// require express router
const router = express.Router();

// require controller
const userController = require('../controllers/userController');

// require middleware
const isAuth = require('../middleware/isAuth');

// User routes
// register route
router.post('/register', userController.register)
// login route
router.post('/login', userController.login)
// logout route
router.get('/logout', isAuth, userController.logout)
// forgot password route
router.post('/forgotPassword', userController.forgotPassword);
// reset password route
router.post('/resetPassword', userController.resetPassword);
// get current logged in user
router.get('/currentUser', isAuth, userController.getCurrentUser);

// export router
module.exports = router;
