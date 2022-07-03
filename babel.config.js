const env = process.env.NODE_ENV || 'development';
const presets = [
  '@babel/preset-react',
  [
    '@babel/preset-env',
    {
      targets: {
        browsers: [
          'Chrome >= 62',
          'Safari >= 10',
          'Firefox >= 52',
          'IE >= 11',
          'Edge >= 15',
          'Opera >= 49',
        ],
      },
      modules: false,
    },
  ],
];

const plugins = [
  'jsx-control-statements',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-function-bind',
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-transform-runtime',
];

if (env === 'development') {
  plugins.push('react-hot-loader/babel', '@babel/plugin-transform-react-jsx-source');
} else {
  plugins.push('transform-react-remove-prop-types');
}

module.exports = {
  presets,
  plugins,
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-transform-modules-commonjs',
      ],
    },
  },
};
