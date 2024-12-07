const express = require('express');
const router = express.Router();

const ImagesController = require('../controllers/images');

//READ
router.get('/:url', ImagesController.images_get_image);

module.exports = router;