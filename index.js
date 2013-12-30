var http = require('http');
var express = require('express');
var capture = require('./lib/capture');

var app = express();
app.get('/', function(req, res) { res.render('index.jade'); });
app.get('/capture', function(req, res) {
  capture({
    url: 'http://localhost:3333/',
    width: 120,
    height: 120,
    file: './bouzuya-120x120.png'
  }, function(err) {
    if (err) throw err;
    capture({
      url: 'http://localhost:3333/',
      width: 200,
      height: 200,
      file: './bouzuya-200x200.png'
    }, function(err) {
      if (err) throw err;
      res.redirect('/');
    });
  });
});
app.listen(3333);

