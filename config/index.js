// merges default and environment related config like node-config does
const merge = require('lodash.merge');
const defaultConfig = require('./default.js');
const env = process.env.PICSIO_ENV || 'development';
const environmentConfig = require(`./${env}.js`);
module.exports = Object.assign(merge(defaultConfig, environmentConfig));
