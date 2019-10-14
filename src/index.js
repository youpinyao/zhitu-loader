
const loaderUtils = require('loader-utils');

const zhitu = require('./zhitu');

module.exports = function loader(source) {
  this.cacheable(false);
  const callback = this.async();
  const file_path = this.resource;

  zhitu.upload({
    file_path,
    ...loaderUtils.getOptions(this),
  }).then((data) => {
    callback(null, data);
  }, (err) => {
    console.error(err);
    callback(null, source);
  });
};

module.exports.raw = true;
