const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Playlists were fetched'
    })
});

router.post('/', (req, res, next) => {
    const playlist = {
        name: req.body.name,
        length: req.body.length
    }
    res.status(201).json({
        message: 'Playlist created',
        createdPlaylist: playlist
    })
});

router.get('/:playlistId', (req, res, next) => {
    const id = req.params.playlistId;
    res.status(200).json({
        message: 'Playlist was fetched',
        id: id
    })
});

router.delete('/:playlistId', (req, res, next) => {
    const id = req.params.playlistId;
    res.status(200).json({
        message: 'Playlist was deleted',
        id: id
    })
});

module.exports = router;