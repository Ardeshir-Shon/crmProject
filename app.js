var expressHandlebars = require('express-handlebars');
var path = require('path');
var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs')
var bodyParser = require('body-parser');

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

app.get('/', function(req, res) {

    res.render(path.join(__dirname, 'views/index.handlebars'));
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
        var out = R("RModules/1_extractRFM.R").data(__dirname.replace(/\\/g, '/')).callSync();
        var out = R("RModules/2_normalization.R").data(__dirname.replace(/\\/g, '/')).callSync();
        try {
            var out = R("RModules/3_optimumNumber.R").data(__dirname.replace(/\\/g, '/')).callSync();
        } catch (err) {
            console.log("plots created ...")
        }
        console.log(__dirname.replace(/\\/g, '/'))
            //console.log(JSON.parse(JSOout[0]));
            // var test = { 'send': 'sjdhs' };
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

app.post('/RFMParam', function(req, res) {

    res.send("the valuses is: " + req.body.R + req.body.F + req.body.M);
    console.log("recieved!")
        // shit(req);
});

app.post('/sliderParam', function(req, res) {

});

// function shit(param) {
//     b = req.body.content;
//     b++;
//     console.log(b);
// }

app.listen(3000, function() {
    console.log("Working on port 3000");
});