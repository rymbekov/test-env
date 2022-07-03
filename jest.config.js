const esModules = ['@picsio/ui', '@picsio/icons'].join('|');

module.exports = {
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js', 'jest-extended'],
  notify: false,
  collectCoverage: false,
  coverageReporters: ['json-summary', 'text', 'text-summary'],
  collectCoverageFrom: [
    'static/assets/js/**/*.{js,jsx}',
  ],
  testEnvironment: 'jsdom',
  globals: {
    __IS_MOBILE__: false,
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esModules})).+\\.js$`],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '\\.svg$': '<rootDir>/fileTransformer.js',
  },
};
