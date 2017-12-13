var express = require('express');
var router = express.Router();
//A counter
//A simple route to display visitor count
router.get('/', function(req, res, next) {
    res.render('index', { title: 'my home' });
});

/* GET home page. */
router.get('/next', function(req, res, next) {
    res.render('indexview', { title: 'DroidHat' });
    num++;
});


router.post('/api/photo', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.end("بروز خطا در ارسال فایل");
        }
        res.end("فایل آپلود شد.");
    });
});

module.exports = router;