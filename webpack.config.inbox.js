const webpack = require('webpack');
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const webpackConfigBase = require('./webpack.config.base');

const config = { ...webpackConfigBase };

const themeFolder = 'templates';
const customBuildFolder = process.env.BUNDLE_BUILD_FOLDER || null;
const buildPath = customBuildFolder ? path.join(__dirname, customBuildFolder) : path.join(__dirname, '../inboxes');
const isMobileDevelopment = process.env.MOBILE_APP === 'true';

config.entry = ['./static/assets/js/index.inbox.js'];

config.output = {
  ...config.output,
  filename: `${themeFolder}/assets/[hash].[name].js`,
  chunkFilename: `${themeFolder}/assets/[hash].[name].js`,
  sourceMapFilename: `${themeFolder}/assets/[hash].[name].js.map`,
  path: buildPath,
  publicPath: config.mode === 'development' ? '/' : '<%- locals.remoteHtmlUrl %>',
};

config.context = __dirname;

config.devServer = {
  host: 'inboxes.picsio.local',
  contentBase: buildPath,
  proxy: [
    {
      context: ['**', `!/${themeFolder}/assets/**`],
      target: 'https://inboxes.picsio.local:3064',
      secure: false,
    },
  ],
};

config.module.rules.push({
  test: /\.scss$/,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
});

config.plugins = [
  ...config.plugins,
  new webpack.EnvironmentPlugin({
    appType: 'inbox',
  }),
  new CleanWebpackPlugin(['assets'], { root: path.join(buildPath, themeFolder) }),
  new MiniCssExtractPlugin({
    filename: `${themeFolder}/assets/[hash].bundle.css`,
  }),
  new CopyWebpackPlugin([{ from: 'templates/inbox.login.html', to: path.join(themeFolder, 'login.ejs') }]),
  new webpack.DefinePlugin({
    __IS_MOBILE__: isMobileDevelopment,
  }),
  new htmlWebpackPlugin({
    template: path.join(__dirname, 'templates/inbox.index.html'),
    path: buildPath,
    filename: path.join(themeFolder, 'index.ejs'),
    hash: false,
  }),
  new WriteFilePlugin({
    test: /\.ejs$/,
    useHashIndex: true,
  }),
  new SentryWebpackPlugin({
    include: themeFolder,
    ignore: ['node_modules'],
    // release: config.bundleName ? config.bundleName : config.bundledAt,
  }),
];

delete config.bundleName;
delete config.bundledAt;

module.exports = config;
