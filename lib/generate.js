var Promise = require('q').Promise;

var server = function(options) {
  return new Promise(function(resolve, reject) {
    var express = require('express');
    var app = express();
    app.get('/', function(req, res) { res.render('index.jade'); });
    app.listen(options.port, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

var client = function(options) {
  var phridge = require('phridge');
  return phridge.spawn().then(function(phantom) {
    return phantom.run(options, function(options, resolve, reject) {
      // phantomjs scope
      var url = options.url;
      var size = options.size;
      var output = options.file;
      var page = webpage.create();
      page.viewportSize = { width: size, height: size };
      page.open(url, function(s) {
        if (s != 'success') {
          return reject(new Error('status is invalid: ' + s));
        }
        page.render(output);
        resolve(output);
      });
    });
  });
};

module.exports = function(options) {
  options = options || {};
  var size = options.size || 120;
  var port = options.port || 3333;
  options = {
    size: size,
    port: port,
    url: 'http://localhost:' + port + '/',
    file: './bouzuya-' + size + 'x' + size + '.png'
  };
  return server(options).then(function() {
    return client(options);
  });
};
