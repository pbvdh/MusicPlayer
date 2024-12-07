const express = require('express');
const router = express.Router();

const ScriptsController = require('../controllers/scripts');

//READ
router.get('/:url', ScriptsController.scripts_get_script);

module.exports = router;