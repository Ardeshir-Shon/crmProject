var express = require('express');
var router = express.Router();
//A counter
var num = 0;
//A simple route to display visitor count
router.get('/index', function(req, res, next) {
    res.render('index', { title: 'my home', count: num++ });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('indexview', { title: 'DroidHat' });
    num++;
});

module.exports = router;