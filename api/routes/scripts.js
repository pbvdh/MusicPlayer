const express = require('express');
const router = express.Router();
const fs = require('fs'); //filesystem module

router.get('/:url', (req, res, next) => {
    const url = req.params.url;
    const s = fs.createReadStream('./src/scripts/'+ url);
    s.on('error', function(err) {
        console.log(err);
        res.status(500).json({error: err.message});
    });
    s.on('open', function () {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript');
        s.pipe(res);
    })

})

module.exports = router;