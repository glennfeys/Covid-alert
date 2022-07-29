var express = require('express');
var mongoose = require('mongoose');
var logger = require('morgan');
var cors = require('cors');
var config = require('./config.json');

var app = express();
var port = 4000;

app.listen(port);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cors())

mongoose.set('useCreateIndex', true);

mongoose.connect(config.databaseUrl, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('DB Connected!'))
    .catch(err => console.log("DB Connection Error: " + err.message));

var routes = require('./routes');
routes(app);

console.log('Server running on port ' + port + ': http://localhost:' + port);

module.exports = app;