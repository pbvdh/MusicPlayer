const fs = require('fs'); //filesystem module

//READ
exports.webpages_get_webpages = (req, res, next) => {
    const s = fs.createReadStream('./src/index.html');
    s.on('error', function(err) {
        console.log(err);
        res.status(500).json({error: err.message});
    });
    s.on('open', function () {
        res.statusCode = 200;
        res.header('Content-Type', 'text/html');
        s.pipe(res);
    });
}