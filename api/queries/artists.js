const db = require('../database.js');

//READ
const selectAllArtists = (callback) => {
    const sql = 'SELECT DISTINCT artist_name FROM song';
    db.all(sql, [], callback);
}

module.exports = {selectAllArtists};