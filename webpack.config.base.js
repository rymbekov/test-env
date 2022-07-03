require('dotenv').config();
const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const bundledAt = new Date().toISOString();
const bundleName = process.env.BUNDLE_NAME || (process.env.NODE_ENV === 'stage' && `Stage: ${bundledAt}`) || null;
console.log('process.env.BUNDLE_NAME: ', process.env.BUNDLE_NAME);
console.log('bundleName: ', bundleName);

const pathConfig = {};

const packagesConfig = {
  cssVariables: path.join(__dirname, 'static/assets/css/variables.scss'),
};

const config = {
  bundledAt,
  bundleName,
  devtool: env === 'development' ? 'eval-source-map' : 'source-map',
  mode: env === 'production' || env === 'stage' ? 'production' : 'development',

  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 100,
    poll: true,
  },

  resolve: {
    alias: {
      ...pathConfig,
      ...packagesConfig,
      ...(env === 'development' ? { 'react-dom': '@hot-loader/react-dom' } : {}),
    },
    extensions: ['.js'],
    symlinks: false,
  },

  module: {
    rules: [
      // Shim
      {
        test: /keypress/,
        use: ['expose-loader?keypress', 'imports-loader?this=>window'],
      },
      {
        test: /Parallel/,
        use: ['expose-loader?Parallel'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [
          /node_modules\/(?!(@picsio\/browser-logger|@picsio\/edit2|@picsio\/logger|@picsio\/utils)\/).*/,
          path.resolve(__dirname, 'static/assets/js/lib'),
        ],
        use: [
          'cache-loader',
          { loader: `babel-loader${env !== 'development' ? '?cacheDirectory=true' : ''}` },
        ],
      },
      {
        test: /\.html$/,
        loader: 'mustache-loader',
        options: {
          render: {
            hash: new Date().getTime(),
            isProd: env === 'production',
          },
        },
      },
      // import svg as React component
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/img',
          esModule: false,
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      PICSIO_ENV: env,
      bundledAt: JSON.stringify(bundledAt),
      bundleName: JSON.stringify(bundleName),
    }),
  ],
};

if (env === 'production' || env === 'stage') {
  config.optimization = {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: false,
        sourceMap: true,
        exclude: [
          /node_modules\/(?!(@picsio\/browser-logger|@picsio\/db|@picsio\/edit2|@picsio\/events|@picsio\/logger|@picsio\/utils)\/).*/,
          path.resolve(__dirname, 'static/assets/js/lib'),
          /objLoader.js/,
          /three.js/,
        ],
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  };
}

// uncomment to generate bundle size report
// if (env === 'production') {
// 	const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// 	const bundleAnalyzerPlugin = new BundleAnalyzerPlugin({
// 		analyzerMode: 'static',
// 		reportFilename: 'bundleAnalyzerReport.html',
// 		defaultSizes: 'parsed',
// 		openAnalyzer: true,
// 		logLevel: 'info',
// 	});
// 	config.plugins.push(bundleAnalyzerPlugin);
// }

module.exports = config;
