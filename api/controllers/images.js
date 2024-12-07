const fs = require('fs'); //filesystem module

//READ
exports.images_get_image = (req, res, next) => {
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
    s.on('error', function(err) {
        console.log(err);
        res.status(500).json({error: err.message});
    });
    s.on('open', function () {
        res.statusCode = 200;
        res.header('Content-Type', filetype);
        s.pipe(res);
    })

}