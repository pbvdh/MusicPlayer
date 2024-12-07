const express = require('express');
const router = express.Router();

const WebpagesController = require('../controllers/webpages');

//READ
router.get('/', WebpagesController.webpages_get_webpages);

module.exports = router;