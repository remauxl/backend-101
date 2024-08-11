const express = require('express')
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')

const router = express.Router();

router.use(authController.isLoggedin)

router.get('/', authController.isLoggedin, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedin, viewController.getTour);
router.get('/login', authController.isLoggedin, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);


module.exports = router;

