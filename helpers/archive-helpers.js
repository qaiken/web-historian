var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

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

exports.downloadUrls = function(){
  exports.readListOfUrls(function(urlList) {
    urlList.forEach(function(url) {
      console.log(url);
      request('http://'+url, function (err, res, body) {
        console.log(body);
        if (!err && res.statusCode == 200) {
          exports.addToArchive(url, body);
        }
      });
    });
  });
};

exports.addToArchive = function(url, body) {
  fs.writeFile(path.join(exports.paths.archivedSites , url), body, function(err){
    if (err) throw err;
  });
};




