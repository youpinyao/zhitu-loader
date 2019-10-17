
const loaderUtils = require('loader-utils');

const zhitu = require('./zhitu');

let count = 0;

module.exports = function loader(source) {
  this.cacheable(true);
  const callback = this.async();
  const file_path = this.resource;

  count += 1;

  if (count === 1) {
    console.log();
  }

  zhitu.upload({
    file_path,
    ...loaderUtils.getOptions(this),
  }).then(({
    data,
    resource,
  }) => {
    this.resource = resource;
    callback(null, data);
  }, () => {
    callback(null, source);
  });
};

module.exports.raw = true;
