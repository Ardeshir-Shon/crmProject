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
var CryptoJS = require("crypto-js");
var dateTime = require('node-datetime');
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



// var tempExplain=new ExplinCluster(155,"این دسته از کاربران کاربران وفادار و پر سود ده هستند که از همه نظر بهترین و ارزشمند ترین کابران ما هستند و باید آنها را راضی نگه داشت.");
// clusterAnalysis.add(tempExplain);
// var tempExplain=new ExplinCluster(255,"این دسته از کاربران، کاربران وفادار و سود ده هستند که مدت کوتاهی است تراکنشی انجام نداده اند که زمان قابل توجهی نیست و بهتر است روی راضی نگه داتن آنها تمرکز کرد.");
// clusterAnalysis.add(tempExplain)
// var tempExplain=new ExplinCluster(145,"این دسته از کاربران، کاربران نسبتا وفادار هستند که البته سود بسیار خوبی داده اند و البته به تازگی هم تراکنش انجام داده اند و به طور کلی جزء کاربران ارزشمند ما حساب میشوند.");
// clusterAnalysis.add(tempExplain);
// var tempExplain=new ExplinCluster(154,"این دسته از کاربران، کاربران وفاداری هستند که سود نسبتا خوبی هم داده اند و البته به تازگی هم تراکنش انجام داده اند و به طور کلی جزء کاربران ارزشمند ما حساب میشوند.");
// clusterAnalysis.add(tempExplain);

app.use(bodyParser.json());

function myDecode(encoded) {
    var idPadded = decodeURIComponent(CryptoJS.RabbitLegacy.decrypt(encoded, "Secret Passphrase"));
    var idG = "";
    for (var i = 1; i < idPadded.length; i += 2) {
        idG = idG + idPadded.charAt(i);
    }
    //return idG;
    return encoded;
}

app.get('/process/:id', function(req, res) {
    res.render(path.join(__dirname, 'views/index.handlebars'));
    //console.log(req.params.id)
    var id = myDecode(req.params.id);
    console.log("id is:" + id);
});

app.get('/', function(req, res) {
    res.render(path.join(__dirname, 'views/signup.handlebars'));
});

app.get('/login', function(req, res) {
    res.render(path.join(__dirname, 'views/login.handlebars'));
});

app.get('/dashboard/:id', function(req, res) {
    res.render(path.join(__dirname, 'views/Dashboard.handlebars'));
    console.log(decodeURIComponent(CryptoJS.RabbitLegacy.decrypt(req.params.id, "Secret Passphrase")))
        // var idPadded = decodeURIComponent(CryptoJS.RabbitLegacy.decrypt(req.params.id, "Secret Passphrase"));
        // var idG = "";
        // for (var i = 1; i < idPadded.length; i += 2) {
        //     idG = idG + idPadded.charAt(i);
        // }
    var idG = myDecode(req.params.id); //parseInt(idG, 10);
    console.log("idg in dashboard: " + idG);
    console.log(typeof idG);
});

app.post('/prevAnalysis', function(req, res) {
    //res.render(path.join(__dirname, 'views/results.handlebars'));
    let p1 = new Promise(function(resolve, reject) {
        var sqlQuery = "SELECT A.tid,B.t_date FROM user_transactions AS A,transactions AS B WHERE A.tid=B.id AND uid= '" + req.body.id + "'";
        con.query(sqlQuery, function(err, result) {
            if (err) console.log("can not refine tid" + err);
            else
                resolve(result);
        })
    });
    p1.then((data) => {
        tdata = data;
        res.send(tdata);
    });

});

app.post('/observe/:tid', function(req, res) {
    let p1 = new Promise(function(resolve, reject) {
        var sqlQuery = "SELECT A.tid, B.desc, A.o_file FROM outputs AS A,class_desc AS B WHERE A.type_class=B.type AND A.tid= '" + req.body.id + "'";
        con.query(sqlQuery, function(err, result) {
            if (err) console.log("can not refine tid" + err);
            else
                resolve(result);
        })
    });
    p1.then((data) => {
        tdata = data;
        res.send(tdata);
    });
});

app.get('/download/:id/:tid', function(req, res) {
    var file = path.join(__dirname, 'public/classes/' + req.params.id + "cluster" + req.params.tid + '.csv')
    res.download(file);
});

app.post('/upload/:id', function(req, res) {

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/public/uploaded/');

    if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir);
    }
    var finalPath = "";
    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        var id = myDecode(req.params.id);
        console.log(id);
        var tid = "";
        let p1 = new Promise(function(resolve, reject) {
            var i = 0;
            finalPath = path.join(form.uploadDir, "trans-df" + i + ".csv");
            while (fs.existsSync(finalPath)) {
                i++;
                finalPath = path.join(form.uploadDir, "trans-df" + i + ".csv").replace(/\\/g, '/');
            }
            fs.renameSync(file.path, finalPath);
            console.log("uploaded.")
            var out = R("RModules/1_extractRFM.R").data(__dirname.replace(/\\/g, '/'), finalPath).callSync();
            var out = R("RModules/2_normalization.R").data(__dirname.replace(/\\/g, '/')).callSync();
            console.log(out);
            minMaxValues = out;
            console.log(minMaxValues.split(";")[3]) // 3 is max of F as you can understand
                // try {
                //     var out = R("RModules/3_optimumNumber.R").data(__dirname.replace(/\\/g, '/')).callSync();
                // } catch (err) {
                //     console.log("plots created ...")
                // }
            resolve();
        });
        let p2 = new Promise(function(resolve, reject) {

            //let p1=new Promise(function (resolve,reject){
            var dt = dateTime.create();
            var formatted = dt.format('Y-m-d H:M:S');
            console.log(finalPath);
            console.log(formatted);
            var sqlQuery = "INSERT INTO crm.transactions (input_file,t_date) VALUES('" + finalPath + "','" + formatted + "');";
            con.query(sqlQuery, function(err, result) {
                if (err) console.log("can not insert transaction");
                else {
                    con.query("SELECT LAST_INSERT_ID() AS lastinsert", function(err, result) {
                        tid = JSON.stringify(result[0].lastinsert);
                        console.log("tid is:" + tid + typeof tid);
                        if (err) console.log("did not mine tid");
                        else {
                            var sqlQuery = "INSERT INTO crm.user_transactions (uid,tid) VALUES('" + id + "','" + tid + "');";
                            con.query(sqlQuery, function(err, result) {
                                if (err) console.log("user transaction did not added");
                                else
                                    resolve();
                            })
                        }
                    })
                }
            });
            //});
            // p1.then(()=>{
            //     console.log("sql jobs done");
            //     resolve();
            // })
        });
        p1.then(() => {
            console.log("p1 done");
            p2.then(() => {
                var pathTid = {};
                let p1 = new Promise(function(resolve, reject) {
                    resolve(pathTid.path = encodeURIComponent(finalPath), pathTid.tid = tid);
                    //resolve(pathTid.path = encodeURIComponent(finalPath),pathTid.tid=encodeURIComponent(CryptoJS.RabbitLegacy.encrypt(tid, "Secret Passphrase").toString()));
                });
                let p2 = new Promise(function(resolve, reject) {
                    resolve(res.send(pathTid));
                });
                p1.then(() => {
                    p2.then(() => {
                        console.log("before encode:" + finalPath + " " + tid);
                        //encodeURIComponent(CryptoJS.RabbitLegacy.encrypt(finalPath, "Secret Passphrase").toString())
                        //console.log("after encode:"+pathTid.path + " " + pathTid.tid);
                        //console.log("after decode"+decodeURIComponent(pathTid.path) + " " + myDecode(pathTid.tid))
                    })
                })

            });
        });
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
    signUpRespond.id = "";

    function errorSet(respond, id) {
        signUpRespond.error = respond;
        signUpRespond.id = id;
        res.send(signUpRespond);
    }

    function respondhandling(whenDone) {
        var idOfUser;
        if (req.body.name !== "" && req.body.email !== "" && req.body.password !== "" && req.body.rePassword !== "") {
            if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)) {
                if (req.body.password == req.body.rePassword) {
                    var sql = "INSERT INTO users (name, email, password) VALUES ('" + req.body.name + "', '" + req.body.email + "' , '" + req.body.password + "')";
                    con.query(sql, function(err, result) {
                        if (err) {
                            console.log("nashod dge!");
                            whenDone('حساب کاربری دیگری با این پست الکترونیک قبلاً ثبت نام کرده است.');
                        } else {
                            let p1 = new Promise(function(resolve, reject) {
                                var sqlGetId = "SELECT `id` FROM users WHERE email ='" + req.body.email + "'";
                                con.query(sqlGetId, function(err, result) {
                                    if (err) throw err; // type not defined in DB
                                    resolve(idOfUser = JSON.stringify(result[0].id));
                                });
                            });
                            p1.then(() => {
                                //whenDone("you signed up.", encodeURIComponent(CryptoJS.RabbitLegacy.encrypt(idOfUser, "Secret Passphrase").toString()));
                                whenDone("you signed up.", idOfUser);
                                console.log("user inserted.");
                                console.log(idOfUser);
                                //console.log(encodeURIComponent(CryptoJS.RabbitLegacy.encrypt(idOfUser, "Secret Passphrase").toString()));
                            });
                        }
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
    loginRespond.id = "";
    loginRespond.tdata = "";

    function errorSet(respond, id_in, resultTdata) {
        loginRespond.error = respond;
        loginRespond.id = id_in;
        loginRespond.tdata = resultTdata;
        res.send(loginRespond);
    }

    function respondhandling(whenDone) {
        var idOfUser;
        if (req.body.email !== "" && req.body.password !== "") {
            if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)) {
                var sql = "SELECT * FROM users  WHERE email ='" + req.body.email + "' AND password ='" + req.body.password + "'";
                con.query(sql, function(err, result) {
                    if (err) throw err;
                    if (typeof result[0] == 'undefined') {
                        whenDone("ایمیلی با این پسورد در سیستم موجود نیست.");
                    } else {
                        let p1 = new Promise(function(resolve, reject) {
                            var sqlGetId = "SELECT `id` FROM users WHERE email ='" + req.body.email + "'";
                            con.query(sqlGetId, function(err, result) {
                                if (err) throw err; // type not defined in DB
                                resolve(idOfUser = JSON.stringify(result[0].id));
                            });
                        });
                        p1.then(() => {
                            //whenDone("you logged in!", encodeURIComponent(CryptoJS.RabbitLegacy.encrypt(idOfUser, "Secret Passphrase").toString()));
                            let pr1 = new Promise(function(resolve, reject) {
                                var sqlQuery = "SELECT A.tid,B.t_date FROM user_transactions AS A,transactions AS B WHERE A.tid=B.id AND uid= '" + idOfUser + "'";
                                con.query(sqlQuery, function(err, result) {
                                    if (err) console.log("can not refine tid" + err);
                                    else
                                        resolve(result);
                                })
                            });
                            pr1.then((result) => {
                                    whenDone("you logged in!", idOfUser, result);
                                    console.log(idOfUser);
                                    //console.log(result);
                                    console.log(JSON.parse(JSON.stringify(result[10].tid)));
                                    console.log(JSON.parse(JSON.stringify(result[10].t_date)));
                                })
                                //console.log(encodeURIComponent(CryptoJS.RabbitLegacy.encrypt(idOfUser, "Secret Passphrase").toString()));
                        });
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

    console.log("req.body.R is: " + req.body.R + " req.body.tid is: " + req.body.tid);
    try {

        var out = R("RModules/3_optimumNumber.R").data(__dirname.replace(/\\/g, '/'), req.body.R, req.body.F, req.body.M).callSync();
    } catch (err) {
        console.log("plots created ...")
    }
    var out = R("RModules/4_clusterEvaluation.R").data(__dirname.replace(/\\/g, '/'), req.body.tid).callSync();
    console.log("clusters evaluated ...")
    var clusterAnalysis = new arraylist;
    var promises = [];
    var evaluateClusters = out;
    console.log(evaluateClusters);
    var k = evaluateClusters.split(";")[0];
    for (var i = 1; i <= k; i++) {
        promises.push(clustersEvaluate(i));
    }

    function clustersEvaluate(idx) {

        return new Promise(function(resolve, reject) {
            var sql = "SELECT `desc` FROM class_desc WHERE type = '" + evaluateClusters.split(";")[idx] + "';"
            con.query(sql, function(err, result) {
                if (err) throw err; // type not defined in DB
                resolve(clusterAnalysis.add(JSON.parse(JSON.stringify(result[0].desc))));
            });
        });
    }

    var promises2 = [];
    for (var j = 1; j <= k; j++) {
        promises.push(addOutputs(j));
    }

    function addOutputs(idx) {
        return new Promise(function(resolve, reject) {
            var sql = "INSERT INTO crm.outputs(tid,type_class,o_file) VALUES('" + req.body.tid + "','" + evaluateClusters.split(";")[idx] + "','" + __dirname.replace(/\\/g, '/') + "/public/classes/" + idx + "cluster" + req.body.tid + ".csv');";
            con.query(sql, function(err, result) {
                if (err) console.log("can not insert output!" + err);
                else {
                    resolve();
                }
            });
        });
    }
    console.log(__dirname.replace(/\\/g, '/'))
        //var charand=myDecode(req.body.tid);
        //console.log("tid is:" + charand + "and before myDecode:" + req.body.tid);
    Promise.all(promises2).then(() => {
        Promise.all(promises).then(() => {
            // destAddr = path.join(__dirname, 'public/classdb/').replace(/\\/g, '/');
            //
            // if (!fs.existsSync(destAddr)) {
            //     fs.mkdirSync(destAddr);
            // }
            // var finalPath = "";
            // var i = 0;
            // var namae = "class" + i + ".csv";
            // finalPath = path.join(destAddr, namae).replace(/\\/g, '/');
            // while (fs.existsSync("1" + finalPath)) {
            //     i++;
            //     namae = "class" + i + ".csv";
            //     finalPath = path.join(destAddr, namae).replace(/\\/g, '/');
            // }
            // var srcAddress = path.join(__dirname, 'public/classes/').replace(/\\/g, '/');
            // console.log(srcAddress + "../");
            // for (var c = 1; c <= clusterAnalysis.length; c++) {
            //     fs.copyFileSync(srcAddress + c + ".csv", destAddr + c + namae);
            //     //fs.renameSync(destAddr+c+".csv",c+finalPath);
            // }
            console.log("uploaded.")
            res.send(clusterAnalysis)
        });
    });

});

app.post('/RFMRange', function(req, res) {

    res.send("the valuses is: " + req.body.rRange + req.body.fRange + req.body.mRange);
});

app.listen(3000, function() {
    console.log("Working on port 3000");
});

//var dateTime = require('node-datetime');
// var dt = dateTime.create();
// var formatted = dt.format('Y-m-d H:M:S');
// console.log(formatted);