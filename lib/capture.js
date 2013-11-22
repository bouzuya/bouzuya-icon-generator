var async = require('async');
var phantom = require('node-phantom');

module.exports = function(params, callback) {
  var url = params.url;
  var width = params.width;
  var height = params.height;
  var output = params.file;
  var ph;
  var page;
  var tasks = [];
  tasks.push(function(next) { phantom.create(next); });
  tasks.push(function(p, next) { ph = p; ph.createPage(next); });
  tasks.push(function(p, next) { page = p; next(); });
  tasks.push(function(next) { page.set('viewportSize', { width: width, height: height }, next); });
  tasks.push(function(next) { page.open(url, next); });
  tasks.push(function(s, next) {
    if (s != 'success') return next(new Error('status is invalid: ' + s));
    page.render(output);
    ph.exit();
    next();
  });
  async.waterfall(tasks, callback);
};

