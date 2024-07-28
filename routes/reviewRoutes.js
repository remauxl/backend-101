const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true});

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews/9487fad
// GET /tour/234fad4/reviews

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReview)
    .post(authController.restrictTo('user'), 
          reviewController.setTourUserIds,
          reviewController.createReview);

router
    .route('/:id')
    .patch(authController.restrictTo('user','admin'),
           reviewController.updateReview)
    .delete(authController.restrictTo('user','admin'),
            reviewController.deleteReview)
    .get(reviewController.getReview);

module.exports = router;
