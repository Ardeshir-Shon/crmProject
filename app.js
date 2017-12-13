var express = require('express');
var expressHandlebars = require('express-handlebars');
var app = express();

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

app.listen(3000);