const {selectAllArtists} = require('../queries/artists.js');

exports.artists_get_all = (req, res, next) => {
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
}