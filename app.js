var config = require('./env.json')[process.env.NODE_ENV || 'development'];
var express = require('express');
const cors = require('cors');
const passport = require('passport');
const bodyparser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var fileUpload = require("express-fileupload");
const mongoose = require('mongoose');

var visitorRouter = require('./routers/visitor');
var adminRouter = require('./routers/admin');

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true);






var app = express();
app.use(cors());

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//set body barser MW 
app.use(bodyparser.json());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));


var server = app.listen( process.env.PORT ||3000, function () {
    console.log('Example app listening on port ');
});



app.use('/admin', adminRouter);
app.use('/visitor', visitorRouter);


app.get("/secretDebug",
    function (req, res, next) {
        console.log(req.get('Authorization'));
        next();
    }, function (req, res) {
        res.json("debugging");
    });



module.exports = app;

