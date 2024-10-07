const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Playlists were fetched'
    })
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Playlist created'
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