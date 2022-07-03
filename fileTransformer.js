const path = require('path');

module.exports = {
  process(src, filename) {
    console.log('src, filename: ', src, filename);
    return `module.exports = ${JSON.stringify(path.basename(filename))};`;
  },
};
