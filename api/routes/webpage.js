const express = require('express');
const router = express.Router();
const fs = require('fs'); //filesystem module

//to do handle error
router.get('/', (req, res, next) => {
    const s = fs.createReadStream('./src/index.html');
    s.on('open', function () {
        res.setHeader('Content-Type', 'html');
        s.pipe(res);
    })

})

module.exports = router;