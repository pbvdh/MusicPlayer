const express = require('express');
const router = express.Router();
const fs = require('fs'); //filesystem module

//to do handle error
router.get('/:url', (req, res, next) => {
    const url = req.params.url;
    const s = fs.createReadStream('./src/scripts/'+ url);
    s.on('open', function () {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript');
        s.pipe(res);
    })

})

module.exports = router;