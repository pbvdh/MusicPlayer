const express = require('express');
const router = express.Router();
const fs = require('fs'); //filesystem module

//to do handle error
router.get('/:url', (req, res, next) => {
    const url = req.params.url;
    const ext = url.substring(url.lastIndexOf('.')+1);
    const mime = {
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        ico: 'image/ico',
    };
    const filetype = mime[ext] || 'text/plain';
    const s = fs.createReadStream('./src/images/'+ url);

    s.on('open', function () {
        res.statusCode = 200;
        res.setHeader('Content-Type', filetype);
        s.pipe(res);
    })

})

module.exports = router;