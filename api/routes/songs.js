const express = require('express');
const router = express.Router();

const SongsController = require('../controllers/songs.js');

//Call corresponding query based on API call method, passing parameters and handling errors

//CREATE
router.post('/', SongsController.songs_create_song);

//READ
router.get('/', SongsController.songs_get_all);

router.get('/:id', SongsController.songs_get_song_by_id);

router.get('/:name/:artist_name', SongsController.songs_get_song_by_artist_and_name);

//UPDATE
router.patch('/', SongsController.songs_update_song);

//DELETE
router.delete('/:id', SongsController.songs_delete_song);

module.exports = router;