const express = require('express');
const router = express.Router();

const PlaylistsController = require('../controllers/playlists');

//Call corresponding query based on API call method, passing parameters and handling errors

//CREATE
router.post('/', PlaylistsController.playlists_create_playlist);

//add song to playlist
router.post('/addSong', PlaylistsController.playlists_add_song);

//READ
router.get('/', PlaylistsController.playlists_get_all);

router.get('/:name', PlaylistsController.playlists_get_by_name);

router.get('/songs/:id', PlaylistsController.playlists_get_songs);

router.get('/withsong/:id', PlaylistsController.playlists_get_playlists_with_song);


//UPDATE
router.patch('/', PlaylistsController.playlists_update_playlist);

router.patch('/songs', PlaylistsController.playlists_update_song);

//DELETE
router.delete('/', PlaylistsController.playlists_delete_playlist);

router.delete('/song', PlaylistsController.playlists_delete_song);

module.exports = router;