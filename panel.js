process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
  });
require('dotenv').config();

// Getting required modues
var express = require('express');
var logger = require('morgan');
var cors = require('cors');
var createError = require('http-errors');
var useragent = require('express-useragent');
let path = require("path");
const fileUpload = require('express-fileupload');

global.appRoot = path.resolve(__dirname + "/");
var app = express();

// Set appRoot and events of global
app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ }));

app.use(useragent.express());
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', path.join(__dirname, '/html'));

// Update middlewares of app
// app.use("/healthcheck", require("./health_check"));

app.use(function (req, res, next) {
    // res.setHeader(
    //     'Content-Security-Policy',
    //     "default-src  'self'  " + process.env.CSP_PANEL_URL + " " + process.env.CSP_API_URL + " https://login.microsoftonline.com  'unsafe-eval'  'unsafe-inline' ; font-src 'self' " + process.env.CSP_PANEL_URL + " " + process.env.CSP_API_URL + "; img-src 'self' " + process.env.CSP_PANEL_URL + " " + process.env.CSP_API_URL + ' data: * ' + "; script-src 'self' " + process.env.CSP_PANEL_URL + " " + process.env.CSP_API_URL + " https://login.microsoftonline.com  'unsafe-eval' 'unsafe-inline'  ; style-src 'self' " + process.env.CSP_PANEL_URL + " " + process.env.CSP_API_URL + " 'unsafe-inline' ; frame-src 'self' " + process.env.CSP_PANEL_URL + " " + process.env.CSP_API_URL
    // );
    res.setHeader(
        'X-Content-Type-Options',
        "nosniff"
    );
    res.setHeader(
        'X-XSS-Protection',
        1
    );
    res.setHeader(
        'Strict-Transport-Security',
        "max-age=31536000;includeSubDomains;preload"
    );
    res.setHeader(
        'Access-Control-Allow-Origin',
        process.env.CSP_PANEL_URL
    );
    next();
});

require("./middlewares")(app,'panel');
app.use("/api/panel", require("./src/panel/routes"));
app.use("/api/setup", require("./src/setup/routes"));

// token cron
const panel_cron = require('./panel_cron');
panel_cron.removeExpiredTokens();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
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
