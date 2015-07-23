var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, function(err,data) {
    var urlList = data.toString().split("\n");
    callback(urlList);
  });
};

exports.isUrlInList = function(url, callback){
  exports.readListOfUrls(function(urlList) {
    if (urlList.indexOf(url) >= 0) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

exports.addUrlToList = function(url,callback){
  fs.appendFile(exports.paths.list, url + "\n", function(err){
    if (err) throw err;
    if(callback) callback();
  });
};

exports.isUrlArchived = function(url, callback){
  fs.open(path.join(exports.paths.archivedSites, url), 'r', function(err, data){
    if (err) {
      callback(false);
      return;
    }
    callback(true);
  });
};

exports.downloadUrls = function(urlArray) {
  var getUrls = function(urlArray) {
    urlArray.forEach(function(url) {
      console.log('URL',url)
      request('http://'+ url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
          exports.addToArchive(url, body);
        }
      });
    });
  };
  if(!urlArray) {
    exports.readListOfUrls(function(urlList) {
      getUrls(urlList);
    });
    return;
  }
  getUrls(urlArray);
};

exports.addToArchive = function(url, body) {
  console.log("url archive", url);
  fs.writeFile(path.join(exports.paths.archivedSites , url), body, function(err){
    if (err) throw err;
  });
};




