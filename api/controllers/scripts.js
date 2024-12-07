const fs = require('fs'); //filesystem module

//READ
exports.scripts_get_script = (req, res, next) => {
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
}