const express = require('express');
const router = express.Router();
const {createPlaylist, selectAllPlaylists, updatePlaylist, selectSongsOnPlaylist, deletePlaylist} = require('../queries/playlists.js');


//Call corresponding query based on API call method, passing parameters and handling errors

router.get('/', (req, res, next) => {
    selectAllPlaylists((err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {      
            const response = {
                count: rows.length,
                songs: rows
            }
            res.status(200).json(response);
        }
    });
});

router.get('/:name', (req, res, next) => {
    const name = req.params.name;
    selectSongsOnPlaylist(name, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {   
            const response = {
                count: rows.length,
                songs: rows
            }
            res.status(200).json(response); 
        }
    });
});


router.post('/', (req, res, next) => {
    const name = req.body.name;
    createPlaylist(name, (err, rows) => {
        if(err){
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({error: err.message});
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            res.status(201).json({
                message: "Playlist created successfully",
                createdPlaylist: rows
            });
        }
    });
});

router.patch('/', (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    updatePlaylist(id, name, (err, rows) => {
        if(err){
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({error: err.message});
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
                        url: `http://localhost:3000/playlists/${id}`
                    }
                }
            });
        }
    });
});


router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    deletePlaylist(id, (err) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            res.status(200).json({message: `Deleted playlist with id: ${id}`});
        }
    });
});

module.exports = router;