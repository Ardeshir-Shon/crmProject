var expressHandlebars = require('express-handlebars');
var path = require('path');
var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var arraylist = require("arraylist");
var R = require("r-script");
let ExplinCluster = require("./ExplainCluster.js")
let config = require('./public/javascripts/config.js');
var con = mysql.createConnection(config);
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

var clusterAnalysis = new arraylist;

// var tempExplain=new ExplinCluster(155,"این دسته از کاربران کاربران وفادار و پر سود ده هستند که از همه نظر بهترین و ارزشمند ترین کابران ما هستند و باید آنها را راضی نگه داشت.");
// clusterAnalysis.add(tempExplain);
// var tempExplain=new ExplinCluster(255,"این دسته از کاربران، کاربران وفادار و سود ده هستند که مدت کوتاهی است تراکنشی انجام نداده اند که زمان قابل توجهی نیست و بهتر است روی راضی نگه داتن آنها تمرکز کرد.");
// clusterAnalysis.add(tempExplain)
// var tempExplain=new ExplinCluster(145,"این دسته از کاربران، کاربران نسبتا وفادار هستند که البته سود بسیار خوبی داده اند و البته به تازگی هم تراکنش انجام داده اند و به طور کلی جزء کاربران ارزشمند ما حساب میشوند.");
// clusterAnalysis.add(tempExplain);
// var tempExplain=new ExplinCluster(154,"این دسته از کاربران، کاربران وفاداری هستند که سود نسبتا خوبی هم داده اند و البته به تازگی هم تراکنش انجام داده اند و به طور کلی جزء کاربران ارزشمند ما حساب میشوند.");
// clusterAnalysis.add(tempExplain);

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

app.get('/dashboard', function(req, res) {
    res.render(path.join(__dirname, 'views/Dashboard.handlebars'));
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
        var out = R("RModules/1_extractRFM.R").data(__dirname.replace(/\\/g, '/')).callSync();
        var out1 = R("RModules/2_normalization.R").data(__dirname.replace(/\\/g, '/')).callSync();
        //console.log(out);
        //minMaxValues = out;
        //console.log(minMaxValues.split(";")[3]) // 3 is max of F as you can understand
        try {
            var out = R("RModules/3_optimumNumber.R").data(__dirname.replace(/\\/g, '/')).callSync();
        } catch (err) {
            console.log("plots created ...")
        }

        try {
            var out = R("RModules/4_clusterEvaluation.R").data(__dirname.replace(/\\/g, '/')).callSync();
        } catch (err) {
            console.log("clusters evaluated ...")
        }
        var evaluateClusters = out;
        var k = evaluateClusters.split(";")[0];
        console.log(evaluateClusters);
        console.log(k);
        for (var i = 1; i <= k; i++) {
            //console.log(evaluateClusters.split(";")[i])
            var sql = "SELECT desc FROM type_desc WHERE type = '" + evaluateClusters.split(";")[i] + "'"
            con.query(sql, function(err, result) {
                if (err) throw err; // type not defined in DB
                clusterAnalysis.add(JSON.parse(result[0].desc));
            });
        }
        console.log(__dirname.replace(/\\/g, '/'))
            //console.log(JSON.parse(JSOout[0]));

        for (var i = 0; i < k; i++)
            console.log(clusterAnalysis.get(i));

        // var sampleArray = ["سلام", "حال شما", "خوبید؟", "قربان شما!"]
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

app.post('/', function(req, res) {
    var signUpRespond = {};
    signUpRespond.error = "";

    function errorSet(respond) {
        signUpRespond.error = respond;
        res.send(signUpRespond);
    }

    function respondhandling(whenDone) {
        if (req.body.name !== "" && req.body.email !== "" && req.body.password !== "" && req.body.rePassword !== "") {
            if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)) {
                if (req.body.password == req.body.rePassword) {
                    var sql = "INSERT INTO users (name, email, password) VALUES ('" + req.body.name + "', '" + req.body.email + "' , '" + req.body.password + "')";
                    con.query(sql, function(err, result) {
                        if (err) throw err;
                        console.log("user inserted.");
                        whenDone("you signed up.")
                    });
                } else {
                    console.log("passwords doesn't match!")
                    whenDone("رمز‌های عبور با یکدیگر تطابق ندارند.")
                }
            } else {
                console.log("email input is not correct!");
                whenDone("ایمیل وارد شده صحیح نیست.")
            }
        } else {
            console.log("something is wrong!");
            whenDone("حداقل یکی از ورودی‌ها را وارد نکرده‌اید.");
        }
    }
    respondhandling(errorSet);
});

app.post('/login', function(req, res) {

    var loginRespond = {};
    loginRespond.error = "";

    function errorSet(respond) {
        loginRespond.error = respond;
        res.send(loginRespond);
    }

    function respondhandling(whenDone) {
        if (req.body.email !== "" && req.body.password !== "") {
            if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)) {
                var sql = "SELECT * FROM users  WHERE email ='" + req.body.email + "' AND password ='" + req.body.password + "'";
                con.query(sql, function(err, result) {
                    if (err) throw err;
                    if (typeof result[0] == 'undefined') {
                        whenDone("ایمیلی با این پسورد در سیستم موجود نیست.");
                    } else {
                        whenDone("you logged in!");
                    }
                });
            } else {
                whenDone("ایمیل وارد شده صحیح نیست.");
            }
        } else {
            whenDone("حداقل یکی از ورودی‌ها را وارد نکرده‌اید.");
        }
    }
    respondhandling(errorSet);
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