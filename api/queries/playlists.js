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
    const sql = `INSERT INTO song_in_playlist (song_id, playlist_id, position) VALUES (?, ?, (SELECT IFNULL(MAX(position), 0) + 1 FROM song_in_playlist WHERE playlist_id == ?))`;
    db.serialize(() => {
        db.run(`PRAGMA foreign_keys=on`); //force sqlite${position} to adhere to foreign key constraints
        db.run(sql, [songId, playlistId, playlistId], callback);
    });
}

//READ
const selectAllPlaylists = (callback) => {
    const sql = 'SELECT p.*, COUNT(song_id) AS length FROM playlist p LEFT JOIN song_in_playlist sip ON p.id = sip.playlist_id GROUP BY p.id ORDER BY name COLLATE NOCASE';
    db.all(sql, [], callback);
}

const selectSongsOnPlaylist = (id, callback) => {
    const sql = `SELECT s.*, sip.position FROM playlist p INNER JOIN song_in_playlist sip ON p.id = sip.playlist_id LEFT JOIN song s ON s.id = sip.song_id WHERE p.id = ? ORDER BY position`;
    db.all(sql, [id], callback);
}

const selectPlaylist = (name, callback) => {
    const sql = `SELECT * FROM playlist WHERE name = ?`
    db.get(sql, [name], callback);
}

const selectPlaylistsWithSong = (songId, callback) => {
    const sql = `SELECT DISTINCT playlist_id AS id, name FROM song_in_playlist sip INNER JOIN playlist p ON p.id = sip.playlist_id WHERE song_id = ?`
    db.all(sql, [songId], callback);
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

const updateSongInPlaylist = (songId, playlistId, position, callback) => {
    if (songId==null || playlistId == null || position == null) {
        return callback({message: "A required field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    } else {
        const sql = 
                `WITH old_position AS (
                    SELECT position 
                    FROM song_in_playlist 
                    WHERE song_id = ${songId} AND playlist_id = ${playlistId}
                )
                UPDATE song_in_playlist 
                SET position = 
                    CASE 
                        WHEN ${position} < (SELECT * FROM old_position) THEN 
                            CASE 
                                WHEN position BETWEEN ${position} AND (SELECT * FROM old_position) - 1 THEN position + 1 
                                WHEN song_id = ${songId} THEN ${position} 
                                ELSE position 
                            END
                        WHEN ${position} > (SELECT * FROM old_position) THEN 
                            CASE 
                                WHEN position BETWEEN (SELECT * FROM old_position) + 1 AND ${position} THEN position - 1 
                                WHEN song_id = ${songId} THEN ${position} 
                                ELSE position 
                            END
                        ELSE position  -- If old position is exactly the new position, don't change anything
                    END
                WHERE playlist_id = ${playlistId};`;
            console.log(sql)
        db.run(sql, function(err) {
            callback(err)
        });
    }
}

//DELETE
const deletePlaylist = (playlistId, callback) => {
    const sql = `DELETE FROM playlist WHERE id = ?;`;
    db.run(sql, [playlistId], callback);
}

const deleteSongsInPlaylist = (playlistId, callback) => {
    if (playlistId == null) {
        return callback({message: "A required field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    }
    const sql = `DELETE FROM song_in_playlist WHERE playlist_id = ?;`;
    db.run(sql, [playlistId], callback);
}

const removeSongFromPlaylist = (playlistId, songId, callback) => {
    if (playlistId == null || songId == null) {
        return callback({message: "A required field is missing. Please check request body.", code: "PARAMETER_ERROR"});
    }
    const sql = `DELETE FROM song_in_playlist WHERE playlist_id = ? AND song_id = ?;`;
    db.run(sql, [playlistId, songId], callback);
}

module.exports = {createPlaylist, selectAllPlaylists, selectPlaylist, selectSongsOnPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist, deleteSongsInPlaylist, removeSongFromPlaylist, updateSongInPlaylist, selectPlaylistsWithSong};