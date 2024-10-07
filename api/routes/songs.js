const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /songs'
    })
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Handling POST requests to /songs'
    })
});

router.get('/:songId', (req, res, next) => {
    const id = req.params.songId;
    res.status(200).json({
        message: 'you passed an ID',
        id: id
    })
});

router.delete('/:songId', (req, res, next) => {
    const id = req.params.songId;
    res.status(200).json({
        message: 'Deleted song!',
        id: id
    })
});

module.exports = router;