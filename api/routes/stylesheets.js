const express = require('express');
const router = express.Router();

const StylesheetsController = require('../controllers/stylesheets');

//READ
router.get('/:url', StylesheetsController.stylesheets_get_stylesheet);

module.exports = router;