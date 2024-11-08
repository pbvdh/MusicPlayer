const db = require('../database.js');

//READ
const selectAllArtists = (callback) => {
    const sql = 'SELECT DISTINCT artist_name FROM song ORDER BY artist_name';
    db.all(sql, [], callback);
}

module.exports = {selectAllArtists};