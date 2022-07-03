const webpack = require('webpack');
const baseConfig = require('../webpack.config.picsio');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  return {
    ...config,
    resolve: baseConfig.resolve,
    module: {
      ...config.module,
      rules: baseConfig.module.rules,
    },
    plugins: [
      ...config.plugins,
      new webpack.DefinePlugin({
        __IS_MOBILE__: false,
      }),
      new MiniCssExtractPlugin({
        filename: 'assets/[hash].bundle.css',
      }),
    ],
  };
};
