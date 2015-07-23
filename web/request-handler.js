var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers.js');
var qs = require('querystring');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  if (req.method === "GET") {
    if (req.url === "/") {
      req.url = "index.html";
    }

    if( path.basename(req.url).indexOf('www') !== -1 ) {
      req.url = path.join(archive.paths['archivedSites'],req.url);
    } else if( path.dirname(req.url).indexOf('public') === -1 ) {
      req.url = path.join(archive.paths['siteAssets'],req.url);
    }

    httpHelpers.serveAssets(res, req.url, function(err,data) {
      if(err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200,httpHelpers.headers);
      res.end(data);
    });

  } else if (req.method === "POST") {

    httpHelpers.collectData(req, function(data) {
      var redirectPath, statusCode;
      var dataObj = qs.parse(data);
      var siteUrl = dataObj.url;
      archive.isUrlInList(siteUrl, function(exist){
        if (exist) {
          redirectPath = path.join(siteUrl);
          statusCode = 301;
        } else {
          archive.addUrlToList(siteUrl);
          archive.downloadUrls();
          statusCode = 302;
          redirectPath = path.join(archive.paths.siteAssets,'loading.html');
        }
        res.writeHead(statusCode, {
          Location: redirectPath
        });
        res.end();
      });
    });

  } else {

    res.writeHead(405);
    res.end('405 Method Not Allowed');
  }
};
