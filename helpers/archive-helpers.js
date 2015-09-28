var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');
var Q = require('q');

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

exports.readListOfUrls = function() {
  var deferred = Q.defer();
  fs.readFile(exports.paths.list, function(err,data) {
    var urlList = data.toString().split("\n");
    deferred.resolve(urlList);
  });
  return deferred.promise;
};

exports.isUrlInList = function(url){
  var deferred = Q.defer();
  exports.readListOfUrls()
    .then(function(urlList) {
      deferred.resolve(urlList.indexOf(url) >= 0);
    });
  return deferred.promise;
};

exports.addUrlToList = function(url){
  var deferred = Q.defer();
  fs.appendFile(exports.paths.list, url + "\n", function(err){
    if (err) deferred.reject(err);
    deferred.resolve(true);
  });
  return deferred.promise;
};

exports.isUrlArchived = function(url){
  var deferred = Q.defer();
  fs.open(path.join(exports.paths.archivedSites, url), 'r', function(err, data){
    if (err) deferred.reject(err);
    deferred.resolve(true);
  });
  return deferred.promise;
};

exports.downloadUrls = function(urlArray) {
  var getUrls = function(urlArray) {
    urlArray.forEach(function(url) {
      request('http://'+ url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
          exports.addToArchive(url, body);
        }
      });
    });
  };
  
  if(!urlArray) {
    exports.readListOfUrls().then(getUrls);
  }

  getUrls(urlArray);
};

exports.addToArchive = function(url, body) {
  fs.writeFile(path.join(exports.paths.archivedSites , url), body, function(err){
    if (err) throw err;
  });
};
