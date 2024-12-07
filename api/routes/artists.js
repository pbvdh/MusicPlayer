const express = require('express');
const router = express.Router();

const ArtistsController = require('../controllers/artists.js');

//READ
router.get('/', ArtistsController.artists_get_all);

module.exports = router;