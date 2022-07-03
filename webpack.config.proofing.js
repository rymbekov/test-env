const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const webpackConfigBase = require('./webpack.config.base');

const config = {
  ...webpackConfigBase,
};

const themeFolder = 'default';
const customBuildFolder = process.env.BUNDLE_BUILD_FOLDER || null;
const buildPath = customBuildFolder
  ? path.join(__dirname, customBuildFolder)
  : path.join(__dirname, '../websites/templates');
const isMobileDevelopment = process.env.MOBILE_APP === 'true';

const pathConfig = {
  AppRouter: path.join(__dirname, 'static/assets/js/router/router.proofing'),
  pluginConstructors: path.join(__dirname, 'static/assets/js/empty'),
  editor: path.join(__dirname, 'static/assets/js/empty'),
  ImportComponent: path.join(__dirname, 'static/assets/js/components/import/empty.js'),
  TagsTree: path.join(__dirname, 'static/assets/js/components/tagsTree/empty/index'),
  KeywordsTree: path.join(__dirname, 'static/assets/js/components/keywordsTreeOld/empty/index'),
  // MentionsComponent: path.join(__dirname, 'static/assets/js/components/mentions/empty/index'),
};

config.resolve.alias = {
  ...config.resolve.alias,
  ...pathConfig,
};

config.entry = ['./static/assets/js/index.proofing.js'];

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
  host: 'show.picsio.local',
  contentBase: buildPath,
  proxy: [
    {
      context: ['**', '!/default/assets/**'],
      target: 'http://show.picsio.local:3033',
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
    appType: 'proofing',
  }),
  new CleanWebpackPlugin(['assets'], { root: path.join(buildPath, themeFolder) }),
  new MiniCssExtractPlugin({
    filename: `${themeFolder}/assets/[hash].bundle.css`,
  }),
  new CopyWebpackPlugin([
    { from: 'templates/proofing.login.html', to: path.join(themeFolder, 'templ', 'login.ejs') },
    { from: './node_modules/@picsio/edit2/public/index.bundle.css', to: 'assets/picsioEditor.css' },
  ]),
  new webpack.DefinePlugin({
    __IS_MOBILE__: isMobileDevelopment,
  }),
  new HtmlWebpackPlugin({
    template: path.join(__dirname, 'templates/proofing.index.html'),
    path: buildPath,
    filename: path.join(themeFolder, 'templ', 'index.ejs'),
    hash: false,
  }),
  new WriteFilePlugin({
    test: /\.ejs$/,
    useHashIndex: true,
  }),
];

if (config.mode === 'production') {
  config.plugins.push(new SentryWebpackPlugin({
    include: themeFolder,
    ignore: ['node_modules'],
    // release: config.bundleName ? config.bundleName : config.bundledAt,
  }));
}

delete config.bundleName;
delete config.bundledAt;

module.exports = config;
