const express = require('express');
const router = express.Router();
const {createPlaylist, selectAllPlaylists, updatePlaylist, selectSongsOnPlaylist, deletePlaylist} = require('../queries/playlists.js');


//Call corresponding query based on API call method, passing parameters and handling errors

router.get('/', (req, res, next) => {
    selectAllPlaylists((err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

router.get('/:name', (req, res, next) => {
    const name = req.params.name;
    selectSongsOnPlaylist(name, (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});


router.post('/', (req, res, next) => {
    const name = req.body.name;
    createPlaylist(name, (err, data) => {
        if(err){
            res.status(500).send(err.message);
        } else {
            res.status(201).send(`Playlist created with ID: ${data.id}`);
        }
    });
});

router.patch('/', (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    updatePlaylist(id, name, (err, data) => {
        if(err){
            res.status(500).send(err.message);
        } else {
            res.status(200).send(`Updated Playlist`);
        }
    });
});


router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    deletePlaylist(id, (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).send("Deleted");
        }
    });
});

module.exports = router;