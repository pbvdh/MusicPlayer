const express = require('express');
const router = express.Router();
const {createPlaylist, selectAllPlaylists, updatePlaylist, selectSongsOnPlaylist, deletePlaylist} = require('../queries/playlists.js');


//Call corresponding query based on API call method, passing parameters and handling errors

router.get('/', (req, res, next) => {
    selectAllPlaylists((err, rows) => {
        if (err) {
            res.status(500).json({error: err});
        } else {      
            res.status(200).json(rows);
        }
    });
});

router.get('/:name', (req, res, next) => {
    const name = req.params.name;
    selectSongsOnPlaylist(name, (err, rows) => {
        if (err) {
            res.status(500).json({error: err});
        } else {
            if(rows.length < 1) {
                res.status(404).json({message: `The playlist '${name}' could not be found`});
            } else {          
                res.status(200).json(rows);
            } 
        }
    });
});


router.post('/', (req, res, next) => {
    const name = req.body.name;
    if (name==null) {
        return res.status(400).json({message: "A required field is missing. Please check request body."});
    }
    createPlaylist(name, (err, data) => {
        if(err){
            res.status(500).json({error: err});
        } else {
            res.status(201).json({message: `Playlist created with ID: ${data.id}`});
        }
    });
});

router.patch('/', (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    updatePlaylist(id, name, (err) => {
        if(err){
            if(err.code=="PARAMETER_ERROR"){
                res.status(400).json({error: err.message});
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            res.status(200).json({message: "Updated Playlist"});
        }
    });
});


router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    deletePlaylist(id, (err, rows) => {
        if (err) {
            res.status(500).json({error: err});
        } else {
            if (rows != null) {
                res.status(200).json({message: "Deleted"});
            } else {
                res.status(404).json({message: "No playlist found with this id"});
            }
        }
    });
});

module.exports = router;