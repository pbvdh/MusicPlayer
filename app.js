const express = require('express');
const app = express();
const morgan = require('morgan');

const songRoutes = require('./api/routes/songs');
const playlistRoutes = require('./api/routes/playlists');

//Funnel requests through this middleware to log incoming requests
//Forwarded through 'next'
app.use(morgan('dev'));

//Routes which should handle requests
app.use('/songs', songRoutes);
app.use('/playlists', playlistRoutes);

//Handle any request that hasn't been handled by an existing route
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    //Forward error
    next(error);
});

//only handles operations that threw an error (from anywhere)
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});


module.exports = app;