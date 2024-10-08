const express = require('express');
const router = express.Router();
const fs = require('fs'); //filesystem module

//to do handle error
router.get('/', (req, res, next) => {
    const s = fs.createReadStream('./src/index.html');
    s.on('open', function () {
        res.statusCode = 200;
        res.header('Content-Type', 'text/html');
        s.pipe(res);
    })

})

module.exports = router;