/* eslint-disable */

var extract = require('extract-zip')
var fse = require('fs-extra');
var path = require('path');
extract(path.resolve(__dirname, 'app.zip'), { dir: path.resolve(__dirname, 'app') }, function (err) {
  // extraction is complete. make sure to handle the err
  err && console.log(err);
  fse.removeSync(path.resolve(__dirname, 'app.zip'));
})
