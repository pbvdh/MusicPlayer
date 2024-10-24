const express = require('express');
const router = express.Router();

const {selectAllArtists} = require('../queries/artists.js');

//READ
router.get('/', (req, res, next) => {
    selectAllArtists((err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {    
            const response = {
                count: rows.length,
                artists: rows
            }
            res.status(200).json(response);
        }
    });
});

module.exports = router;