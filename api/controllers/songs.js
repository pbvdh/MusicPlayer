const {createSong, selectAllSongs, selectSongByNames, selectSongById, deleteSong, updateSongDetails} = require('../queries/songs.js');

//CREATE
exports.songs_create_song = (req, res, next) => {
    const name = req.body.name;
    const filepath = req.body.filepath;
    const genre = req.body.genre;
    const duration_seconds = req.body.duration_seconds != null ? parseInt(req.body.duration_seconds) : null;
    const artist_name = req.body.artist_name;

    createSong(name, filepath, genre, duration_seconds, artist_name, (err, rows) => {
        if(err){
            if(err.code=="PARAMETER_ERROR") {
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "name, filepath, genre, duration_seconds (optional), artist_name"
                });
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            res.status(201).json({
                message: "Song created successfully",
                createdSong: rows
            });
        }
    });
}

//READ
exports.songs_get_all = (req, res, next) => {
    selectAllSongs((err, rows) => {
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
}

exports.songs_get_song_by_id = (req, res, next) => {
    const id = req.params.id;
    selectSongById(id, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            if(rows == null) {
                res.status(404).json({message: `No song found with id: ${id}`});
            } else {          
                res.status(200).json(rows);
            }   
        }
    });
}

exports.songs_get_song_by_artist_and_name = (req, res, next) => {
    const name = req.params.name;
    const artist_name = req.params.artist_name
    selectSongByNames(name, artist_name, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            if(rows.length < 1) {
                res.status(404).json({message: `The song '${name}' by '${artist_name}' could not be found`});
            } else {          
                res.status(200).json(rows);
            } 
        }
    });
}

//UPDATE
exports.songs_update_song = (req, res, next) => {
    const id = req.body.id;
    const number_of_plays = req.body.number_of_plays != null ? parseInt(req.body.number_of_plays) : null;
    const genre = req.body.genre;
    updateSongDetails(id, number_of_plays, genre, (err, rows) => {
        if(err){
            if(err.code=="PARAMETER_ERROR") {
                res.status(400).json({
                    error: err.message,
                    requiredParameters: "id, number_of_plays (optional), genre(optional)"
                });
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            res.status(200).json({
                message: `Successfully updated song with id: ${id}`,
                song: rows
            });
        }
    });
}

//DELETE
exports.songs_delete_song = (req, res, next) => {
    const id = req.params.id;
    deleteSong(id, (err, rows) => {
        if (err) {
            if(err.code=="PARAMETER_ERROR") {
                res.status(400).json({error: err.message});
            } else {
                res.status(500).json({error: err.message});
            }
        } else {
            res.status(200).json({message: `Deleted song with id: ${id}`});
        }
    });
}
