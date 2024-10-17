const express = require('express');
const app = express();
const morgan = require('morgan');

//routes
const songRoutes = require('./api/routes/songs');
const playlistRoutes = require('./api/routes/playlists');

//routes for handling files
const webpageRoutes = require('./api/routes/webpage')
const stylesheetRoutes = require('./api/routes/stylesheets')
const imageRoutes = require('./api/routes/images')
const scriptRoutes = require('./api/routes/scripts')

//Funnel requests through this middleware (forwarded via 'next')
//log incoming requests
app.use(morgan('dev'));
//make mp3 folder publicly accessible once you know the filepath
app.use(express.static('../mp3_library'));
//parse bodies
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//adjust headers for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();    
})

//Routes which should handle requests 
app.use('/songs', songRoutes);
app.use('/playlists', playlistRoutes);

//Routes which return files
app.use('/index', webpageRoutes);
app.use('/stylesheets', stylesheetRoutes);
app.use('/images', imageRoutes);
app.use('/scripts', scriptRoutes);

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