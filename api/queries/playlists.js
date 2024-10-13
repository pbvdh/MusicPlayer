const db = require('../database.js');

//CREATE
const createPlaylist = (name, callback) => {
    const sql = `INSERT INTO playlist (name) VALUES (?)`;
    db.run(sql, [name], function(err) {
        callback(err, {id: this.lastID})
    });
}

//READ
const selectAllPlaylists = (callback) => {
    const sql = 'SELECT * FROM playlist';
    db.all(sql, [], callback);
}

const selectSongsOnPlaylist = (name, callback) => {
    const sql = `SELECT s.* FROM playlist p INNER JOIN song_in_playlist sip ON p.id = sip.playlist_id LEFT JOIN song s ON s.id = sip.song_id WHERE p.name = ?`
    db.all(sql, [name], callback)
}

//UPDATE
const updatePlaylist = (id, name, callback) => {
    const sql = `UPDATE playlist SET name = ? WHERE id = ?`;
    db.run(sql, [name, id], callback)
}

//DELETE
const deletePlaylist = (id, callback) => {
    const sql = `DELETE FROM playlists WHERE id = ?`;
    db.run(sql [id], callback);
}

module.exports = {createPlaylist, selectAllPlaylists, selectSongsOnPlaylist, updatePlaylist, deletePlaylist};