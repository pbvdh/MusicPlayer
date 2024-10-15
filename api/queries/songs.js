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

const selectSongById = (id, callback) => {
    const sql = `SELECT * FROM song WHERE id = ?`;
    db.all(sql, [id], callback);
}

const selectSongByNames = (name, artist_name, callback) => {
    const sql = `SELECT * FROM song WHERE name = ? AND artist_name = ?`;
    db.get(sql, [name, artist_name], callback);
}

//UPDATE
const updateSongDetails = (id, number_of_plays, genre, callback) => {
    //different query depending on which parameters are passed
    if (id==null) {
        return callback({message: "ID field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    }
    if(number_of_plays == null) {
        if(genre == null) {
            return callback({message: "No valid parameters received", code: "PARAMETER_ERROR"});
        }else {
            const sql = `UPDATE song SET genre = ? WHERE id = ?`;
            db.close(sql, [genre, id], callback);
        }     
    } else if(genre == null) {
        const sql = `UPDATE song SET number_of_plays = ? WHERE id = ?`;
        db.run(sql, [number_of_plays, id], callback);
    } else {
        const sql = `UPDATE song SET number_of_plays = ?, genre = ? WHERE id = ?`;
        db.run(sql, [number_of_plays, genre, id], callback);
    }
}


//DELETE
const deleteSong = (id, callback) => {
    const sql = `DELETE FROM song WHERE id = ?`;
    db.run(sql, [id], callback);
}

module.exports = {createSong, selectAllSongs, selectSongByNames, selectSongById, deleteSong, updateSongDetails};