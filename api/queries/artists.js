const db = require('../database.js');

//READ
const selectAllArtists = (callback) => {
    const sql = 'SELECT DISTINCT artist_name FROM song ORDER BY artist_name COLLATE NOCASE';
    db.all(sql, [], callback);
}

module.exports = {selectAllArtists};