var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds
};

exports.serveAssets = function(res, asset, callback) {
  var contentType;
  var ext = path.extname(asset);

  if( ext === '.css' ) {
    contentType = 'text/css'
  } else if ( ext === '.js' ) {
    contentType = 'application/js';
  } else {
    contentType = 'text/html';
  }

  res.setHeader('Content-Type',contentType);

  fs.readFile(asset, callback);
};

// As you progress, keep thinking about what helper functions you can put here!

exports.collectData = function(req, callback) {
  var data = "";
  req.on('data', function(chunk){
    data += chunk;
  });

  req.on('end', function(){
    callback(data);
  });
};
