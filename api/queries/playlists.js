const db = require('../database.js');

//CREATE
const createPlaylist = (name, callback) => {
    if (name==null) {
        return callback({message: "A required field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    }
    const sql = `INSERT INTO playlist (name) VALUES (?)`;
    db.run(sql, [name], function(err) {
        callback(err, {id: this.lastID, name})
    });
}

const addSongToPlaylist = (playlistId, songId, callback) => {
    if(playlistId == null || songId == null){
        return callback({message: "A required field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    }
    const sql = `INSERT INTO song_in_playlist (song_id, playlist_id) VALUES (?, ?)`;
    db.serialize(() => {
        db.run(`PRAGMA foreign_keys=on`); //force sqlite3 to adhere to foreign key constraints
        db.run(sql, [songId, playlistId], callback);
    });
}

//READ
const selectAllPlaylists = (callback) => {
    const sql = 'SELECT * FROM playlist ORDER BY name';
    db.all(sql, [], callback);
}

const selectSongsOnPlaylist = (id, callback) => {
    const sql = `SELECT s.* FROM playlist p INNER JOIN song_in_playlist sip ON p.id = sip.playlist_id LEFT JOIN song s ON s.id = sip.song_id WHERE p.id = ?`;
    db.all(sql, [id], callback);
}

const selectPlaylist = (name, callback) => {
    const sql = `SELECT * FROM playlist WHERE name = ?`
    db.get(sql, [name], callback);
}

//UPDATE
const updatePlaylist = (id, name, callback) => {
    if (id==null || name == null) {
        return callback({message: "A required field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    } else {
        const sql = `UPDATE playlist SET name = ? WHERE id = ?`;
        db.run(sql, [name, id], function(err) {
            callback(err, {id, name})
        });
    }
}

//DELETE
const deletePlaylist = (id, callback) => {
    if (id==null) {
        return callback({message: "A required field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    }
    const sql = `DELETE FROM playlist WHERE id = ?`;
    db.run(sql, id, callback);
}

module.exports = {createPlaylist, selectAllPlaylists, selectPlaylist, selectSongsOnPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist};