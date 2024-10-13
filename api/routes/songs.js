const express = require('express');
const router = express.Router();

const {selectAllSongs, selectSongByNames, selectSongsByName, deleteSong, updateSongDetails} = require('../queries/songs.js');
const { createSong } = require('../queries/songs.js');

//Call corresponding query based on API call method, passing parameters and handling errors

router.get('/', (req, res, next) => {
    selectAllSongs((err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

router.get('/:name', (req, res, next) => {
    const name = req.params.name;
    selectSongsByName(name, (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

router.get('/:name/:artist_name', (req, res, next) => {
    const name = req.params.name;
    const artist_name = req.params.artist_name
    selectSongByNames(name, artist_name, (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

router.post('/', (req, res, next) => {
    const name = req.body.name;
    const filepath = req.body.filepath;
    const genre = req.body.genre;
    const duration_seconds = req.body.duration_seconds;
    const artist_name = req.body.artist_name;
    createSong(name, filepath, genre, duration_seconds, artist_name, (err, data) => {
        if(err){
            res.status(500).send(err.message);
        } else {
            res.status(201).send(`Song created with ID: ${data.id}`);
        }
    });
});

router.patch('/', (req, res, next) => {
    const id = req.body.id;
    const number_of_plays = req.body.number_of_plays;
    const genre = req.body.genre;
    updateSongDetails(id, number_of_plays, genre, (err, data) => {
        if(err){
            res.status(500).send(err.message);
        } else {
            res.status(200).send(`Updated Playlist`);
        }
    });
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    deleteSong(id, (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).send("Deleted");
        }
    });
});

module.exports = router;