process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

// Setup Environment
require('dotenv').config();

// Getting required modues
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const useragent = require('express-useragent');
const path = require("path");
const fileUpload = require('express-fileupload');

const app = express();

// Set appRoot and events of global
global.appRoot = path.resolve(__dirname + "/");
global.events = [];

// Update middlewares of app
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', path.join(__dirname, '/html'));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '50mb', extended: true }));
app.use(fileUpload({ }));
app.use(useragent.express());

// Defining Routes
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


require("./middlewares")(app, 'All');
app.use("/api/", require("./src/routes"));

// token cron
const panel_cron = require('./panel_cron');
panel_cron.removeExpiredTokens();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    res.json({
        message: "Invalid Request."
    });
});

module.exports = app;