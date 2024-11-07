const express = require('express');
const router = express.Router();
const {createPlaylist, addSongToPlaylist, selectAllPlaylists, updatePlaylist, selectSongsOnPlaylist, selectPlaylist, deletePlaylist, deleteSongsInPlaylist, removeSongFromPlaylist, updateSongInPlaylist} = require('../queries/playlists.js');


//Call corresponding query based on API call method, passing parameters and handling errors

//CREATE
router.post('/', (req, res, next) => {
    const name = req.body.name;
    createPlaylist(name, (err, rows) => {
        if(err){
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "name"
                });
            } else {
                if(err.message.includes("UNIQUE constraint failed")){
                    res.status(409).json({
                        message: `A playlist with this name already exists`
                    });
                } else {
                    res.status(500).json({error: err.message});
                }
            }
        } else {
            res.status(201).json({
                message: "Playlist created successfully",
                createdPlaylist: rows
            });
        }
    });
});

//add song to playlist
router.post('/addSong', (req, res, next) => {
    const playlistId = req.body.playlistId;
    const songId = req.body.songId;

    addSongToPlaylist(playlistId, songId, (err) => {
        if (err) {
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "playlistId, songId"
                });
            } else {
                if(err.message.includes("UNIQUE constraint failed")){
                    res.status(409).json({
                        message: `Song already exists in this playlist`
                    });
                } else {
                    res.status(500).json({error: err.message});
                } 
            }
        } else {
            res.status(201).json({
                message: `Song ${songId} added to playlist ${playlistId}`,
                songId: songId,
                playlistId: playlistId
            });
        }
    });
});

//READ
router.get('/', (req, res, next) => {
    selectAllPlaylists((err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {      
            const response = {
                count: rows.length,
                playlists: rows
            }
            res.status(200).json(response);
        }
    });
});

router.get('/:name', (req, res, next) => {
    const name = req.params.name;
    selectPlaylist(name, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {   
            if (rows == null) {
                res.status(404).json({
                    message: `No playlist found with name: ${name}`,
                    searchByIdInstead: {
                        type: 'GET',
                        url: `http://localhost:3000/playlists/songs/:id`
                    }
                });
            } else {
                res.status(200).json(rows); 
            }
        }
    });
});

router.get('/songs/:id', (req, res, next) => {
    const id = req.params.id;
    selectSongsOnPlaylist(id, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {   
            const response = {
                playlistId: id,
                count: rows.length,
                songs: rows
            }
            res.status(200).json(response); 
        }
    });
});


//UPDATE
router.patch('/', (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    updatePlaylist(id, name, (err, rows) => {
        if(err){
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "id, name"
                });
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            res.status(200).json({
                message: `Updated Playlist with id: ${id}`,
                updatedPlaylist: {
                    id: rows.id,
                    name: rows.name,
                    songs: {
                        type: 'GET',
                        url: `http://localhost:3000/playlists/songs/${rows.id}`
                    }
                }
            });
        }
    });
});

router.patch('/songs', (req, res, next) => {
    const songId = req.body.songId;
    const playlistId = req.body.playlistId;
    const position = req.body.position;
    updateSongInPlaylist(songId, playlistId, position, (err) => {
        if (err) {
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "songId, playlistId, position"
                });
            } else {
                res.status(500).json({error: err.message});
            } 
        } else {
            res.status(200).json({
                message: `Updated song: ${songId} in playlist: ${playlistId}`,
                updatedPlaylist: {
                        type: 'GET',
                        url: `http://localhost:3000/playlists/songs/${playlistId}`
                }
            });
        }
    });
});

//DELETE
router.delete('/', (req, res, next) => {
    const id = req.body.id;
    deleteSongsInPlaylist(id, (err) => {
        if (err) {
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "id"
                });
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            deletePlaylist(id, (err) => {
                if (err) {
                    res.status(500).json({error: err.message});
                } else {
                    res.status(200).json({message: `Deleted playlist with id: ${id}`});
                }
            });
        }
    });  
});

router.delete('/song', (req, res, next) => {
    const playlistId = req.body.playlistId;
    const songId = req.body.songId;
    removeSongFromPlaylist(playlistId, songId, (err) => {
        if (err) {
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "playlistId, songId"
                });
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            res.status(200).json({message: `Deleted song: ${songId} from playlist: ${playlistId}`})
        }
    });
})

module.exports = router;