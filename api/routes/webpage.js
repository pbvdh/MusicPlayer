const express = require('express');
const router = express.Router();
const fs = require('fs'); //filesystem module

router.get('/', (req, res, next) => {
    const s = fs.createReadStream('./src/index.html');
    s.on('error', function(err) {
        console.log(err);
        res.status(500).json({error: err.message});
    });
    s.on('open', function () {
        res.statusCode = 200;
        res.header('Content-Type', 'text/html');
        s.pipe(res);
    })

})

module.exports = router;