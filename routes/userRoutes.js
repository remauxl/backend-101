const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();


router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout',authController.logout)

router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

router.use(authController.protect);


router
  .route('/updateMyPassword')
  .patch(authController.updateMyPassword);

router
  .route('/me')
  .get(userController.getMe,userController.getUser);
  
router
  .route('/updateMe')
  .patch(userController.uploadUserPhoto , userController.resizeUserPhoto ,userController.updateMe);

router
  .route('/deleteMe')
  .delete(userController.deleteMe);


router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)

  .delete(userController.deleteUser);



module.exports = router;
