var express = require('express');
var expressHandlebars = require('express-handlebars');
var multer = require('multer');
var app = express();

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
        console.log(file.mimetype);
    }
});

var upload = multer({ storage: storage }).single('userPhoto');


app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'));
app.engine('handlebars', expressHandlebars({
    helpers: {
        toJSON: function(object) {
            return JSON.stringify(object);
        }
    }
}));

var index = require('./routes/index');
app.use('/', index);

app.listen(3000, function() {
    console.log("Working on port 3000");
});

var R = require("r-script");
var out = R("RModules/1_extractRFM.R").data(__dirname.replace(/\\/g, '/')).callSync();
var out = R("RModules/2_normalization.R").data(__dirname.replace(/\\/g, '/')).callSync();
var out = R("RModules/3_optimumNumber.R").data(__dirname.replace(/\\/g, '/')).callSync();

console.log(__dirname.replace(/\\/g, '/'))
    //console.log(JSON.parse(JSOout[0]));