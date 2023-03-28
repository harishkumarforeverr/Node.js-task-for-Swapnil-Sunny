process.on('uncaughtException', function (err) {
    console.error("SDK API Error:", err);
    console.log("Node NOT Exiting...");
});
// Setup Environment
require('dotenv').config();

// Getting required modues
var express = require('express');
var logger = require('morgan');
var cors = require('cors');
var useragent = require('express-useragent');
let path = require("path");
global.appRoot = path.resolve(__dirname + "/");
global.events = [];
var app = express();

// Set appRoot and events of global
app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(useragent.express());

// Update middlewares of app
require("./middlewares")(app);
app.use("/api/sdk", require("./src/sdk/routes"));
// app.use("/healthcheck", require("./health_check"));

// catch 404 and forward to error handler
app.use(function (req, res) {
    res.json({
        message: "Invalid Request."
    });
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    console.log(err);
    res.json({
        message: "Invalid Request."
    });
});

module.exports = app;
