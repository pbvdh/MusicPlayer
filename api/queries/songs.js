const db = require('../database.js');

//CREATE 
//Not sure if this will be used
const createSong = (name, filepath, genre, duration_seconds, artist_name, callback) => {
    const sql = `INSERT INTO song (name, filepath, genre, duration_seconds, artist_name) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, filepath, genre, duration_seconds, artist_name], function(err) {
        callback(err, {id: this.lastID})
    });
}

//READ
const selectAllSongs = (callback) => {
    const sql = 'SELECT * FROM song';
    db.all(sql, [], callback);//callback holds the error, could rename variable as err
}

const selectSongsByName = (name, callback) => {
    const sql = `SELECT * FROM song WHERE name = ?`;
    db.all(sql, [name], callback);
}

const selectSongByNames = (name, artist_name, callback) => {
    const sql = `SELECT * FROM song WHERE name = ? AND artist_name = ?`;
    db.get(sql, [name, artist_name], callback);
}

//UPDATE
const updateSongDetails = (id, number_of_plays, genre, callback) => {
    const sql = `UPDATE song SET number_of_plays = ?, genre = ? WHERE id = ?`;
    db.run(sql, [number_of_plays, genre, id], callback);
}


//DELETE
const deleteSong = (id, callback) => {
    const sql = `DELETE FROM song WHERE id = ?`;
    db.run(sql, [id], callback);
}

module.exports = {createSong, selectAllSongs, selectSongByNames, selectSongsByName, deleteSong, updateSongDetails};