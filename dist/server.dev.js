"use strict";

var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    dotenv = require('dotenv'),
    Discord = require('discord.js'),
    client = new Discord.Client();

dotenv.config();
app.set('view engine', 'pug');
app.set('views', 'pages');
app.use('/assets', express["static"]("".concat(__dirname, "/assets")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use('/api', require('./routes/api.js')(client));
app.get('/', function (req, res) {
  return res.render('home');
});
app.get('/discord', function (req, res) {
  return res.redirect('https://discord.gg/jjRkeAf4jh');
});
app.get('/start', function (req, res) {
  return res.render('start');
});
app.get('/winstreaks', function (req, res) {
  return res.render('winstreaks');
});
app.get('/winstreaks/:token', function (req, res) {
  return res.render('winstreak', {
    token: req.params.token
  });
});
app.get('/clear', function (req, res) {
  return res.send("<script>localStorage.clear();window.location.href = '/';</script>");
}); // Register 404 errors (by default is triggered when no other route is served)

app.use(function (req, res, next) {
  var err = new Error('Not found');
  err.code = 404;
  err.message = 'Not found';
  next(err);
}); // Very rudimentary error handler...

app.use(function (err, req, res, next) {
  var handleError = function handleError() {
    if (!err.toString || typeof err.toString !== 'function') err = 'Unknown Error';
    if (!err) return {
      code: 404,
      message: 'Not found'
    }; // Check that error code is valid, if not return 500: Internal server error

    var code = isNaN(err.code) ? 500 : err.code || 500;
    if (err.code < 200) code = 500;
    if (err.code > 599) code = 500;
    return {
      code: code,
      message: err.message || err.toString().replace(/Error: ?/, '')
    };
  };

  var errorData = handleError();
  console.error(req.url, err, errorData);
  res.status(errorData.code);

  if (req.accepts('html')) {
    if (errorData.code === 500) errorData.message = 'Internal server error';
    return res.render('error', {
      error: errorData
    });
  }

  if (req.accepts('json')) return res.json({
    success: false,
    error: errorData
  });
  res.type('txt').send(errorData.message);
});
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('👌 Listening on http://localhost:%s', listener.address().port);
});