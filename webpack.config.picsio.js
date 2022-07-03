const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const webpackConfigBase = require('./webpack.config.base');

const config = { ...webpackConfigBase };
const buildFolderName = 'dist';
const customBuildFolder = process.env.BUNDLE_BUILD_FOLDER || null;
const buildPath = customBuildFolder
  ? path.join(__dirname, customBuildFolder)
  : path.join(__dirname, buildFolderName);

const pathConfig = {
  AppRouter: path.join(__dirname, 'static/assets/js/router/router'),
};

const isMobileDevelopment = process.env.MOBILE_APP === 'true';

config.resolve.alias = { ...config.resolve.alias, ...pathConfig };

if (config.mode === 'development') {
  config.entry = ['react-hot-loader/patch', './static/assets/js/index.js'];
} else {
  config.entry = ['./static/assets/js/index.js'];
}

config.output = {
  ...config.output,
  filename: 'assets/[hash].[name].js',
  chunkFilename: 'assets/[hash].[name].js',
  sourceMapFilename: 'assets/[hash].[name].js.map',
  path: buildPath,
  publicPath: config.mode === 'development' || isMobileDevelopment ? '/' : '<%- locals.remoteHtmlUrl %>',
};

config.context = __dirname;

config.devServer = {
  index: '',
  host: process.env.HOST_NAME || 'picsio.local',
  contentBase: buildPath,
  hot: true,
  proxy: [
    {
      context: '/server-assets',
      target: 'https://localhost:8081/assets',
      pathRewrite: { '^/server-assets': '' },
      secure: false,
    },
    {
      context: () => true,
      target: 'https://localhost:8081',
      logLevel: 'debug',
      secure: false,
    },
  ],
};

config.module.rules.push({
  test: /\.scss$/,
  use: [
    config.mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        url: true,
      },
    },
    'sass-loader',
  ],
});

let CopyRules = [
  // { from: 'static/assets/img', to: 'assets/img' },
  { from: './node_modules/@picsio/edit2/public/index.bundle.css', to: 'assets/picsioEditor.css' },
]

if (isMobileDevelopment) {
  const serverStaticPath = '../server/static';
  CopyRules = [
    ...CopyRules,
    { from: `${serverStaticPath}/worker.js`, to: 'worker.js' },
    { from: `${serverStaticPath}/manifest.json`, to: 'manifest.json' },
    { from: `${serverStaticPath}/manifest.webmanifest`, to: 'manifest.webmanifest' },
    { from: `${serverStaticPath}/picsio.png`, to: 'picsio.png' },
    { from: `${serverStaticPath}/picsio-logo-512.png`, to: 'picsio-logo-512.png' },
    { from: `${serverStaticPath}/maskable_icon.png`, to: 'maskable_icon.png' },
  ]
}

config.plugins = [
  ...config.plugins,
  new webpack.EnvironmentPlugin({
    appType: 'main',
  }),
  new CleanWebpackPlugin(customBuildFolder
    ? [buildFolderName, customBuildFolder]
    : [buildFolderName]),
  new MiniCssExtractPlugin({
    filename: 'assets/[hash].bundle.css',
  }),
  new CopyWebpackPlugin(CopyRules),
  new webpack.DefinePlugin({
    __IS_MOBILE__: isMobileDevelopment,
  }),
  new HtmlWebpackPlugin({
    template: path.join(__dirname, isMobileDevelopment ? 'templates/mobile.index.html' : 'templates/index.html'),
    path: buildPath,
    filename: 'index.html',
    hash: false,
  }),
  new AddAssetHtmlPlugin({
    filepath: require.resolve('./static/assets/js/prebid-google-ads.js'),
    outputPath: 'assets/',
    publicPath: config.mode === 'production' ? `<%- locals.remoteHtmlUrl %>/assets/` : 'assets/',
  }),
  new WriteFilePlugin({
    test: /\.html$/,
    useHashIndex: true,
  }),
];

if (config.mode === 'development') {
  config.plugins.push(
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // add errors to webpack instead of warnings
      failOnError: false,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
  );
}

if (config.mode === 'production') {
  const data = {
    include: `${buildPath}/assets`,
    ignore: ['node_modules'],
  };

  if (config.bundleName) {
    data.release = config.bundleName;
  }

  config.plugins.push(new SentryWebpackPlugin(data));
}

delete config.bundleName;
delete config.bundledAt;

module.exports = config;
