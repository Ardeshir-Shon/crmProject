var expressHandlebars = require('express-handlebars');
var path = require('path');
var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs')
var bodyParser = require('body-parser');
var mysql = require('mysql');
let config = require('./public/javascripts/config.js');

app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', expressHandlebars({
    helpers: {
        toJSON: function(object) {
            return JSON.stringify(object);
        }
    }
}));

app.use(bodyParser.json());

app.get('/process', function(req, res) {

    res.render(path.join(__dirname, 'views/index.handlebars'));
});

app.get('/', function(req, res) {

    res.render(path.join(__dirname, 'views/signup.handlebars'));
});

app.get('/login', function(req, res) {

    res.render(path.join(__dirname, 'views/login.handlebars'));
});

app.post('/upload', function(req, res) {

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, "trans-df.csv"));
        console.log("uploaded.")
            var R = require("r-script");
            var out1 = R("RModules/1_extractRFM.R").data(__dirname.replace(/\\/g, '/')).callSync();
            var out2 = R("RModules/2_normalization.R").data(__dirname.replace(/\\/g, '/')).callSync();
            console.log(out2);
            minMaxValues=out2;
            console.log(minMaxValues.split(";")[3])// 3 is max of F as you can understand
            try {
                var out3 = R("RModules/3_optimumNumber.R").data(__dirname.replace(/\\/g, '/')).callSync();
            } catch (err) {
                console.log("plots created ...")
            }

            try {
                var out4 = R("RModules/4_clusterEvaluation.R").data(__dirname.replace(/\\/g, '/')).callSync();
            } catch (err) {
                console.log("clusters evaluated ...")
            }
            var evaluateClusters=out4;
            var k=evaluateClusters.split(";")[0];
            console.log(evaluateClusters);
            console.log(k);
            for (var i=1;i<=k;i++){
                console.log(evaluateClusters.split(";")[i])
            }
            console.log(__dirname.replace(/\\/g, '/'))
                //console.log(JSON.parse(JSOout[0]));
        res.end('success');
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // parse the incoming request containing the form data
    form.parse(req);

    // res.sendfile(path.join(__dirname, "plots", "mr.html"));
});

app.post('/login', function(req, res) {

    res.send("the valuses is: " + req.body.email + " | " + req.body.password);
    console.log(req.body.email)
});

app.post('/RFMParam', function(req, res) {
    res.send("the valuses is: " + req.body.R + req.body.F + req.body.M);
});

app.post('/RFMRange', function(req, res) {

    res.send("the valuses is: " + req.body.rRange + req.body.fRange + req.body.mRange);
    // shit(req);
});

app.listen(3000, function() {
    console.log("Working on port 3000");
});

// var max = 12;
// var min = 120;


// module.exports.min = min;
// module.exports.max = max;

var con = mysql.createConnection(config);