module.exports.isProduction = () => (process.env.NODE_ENV || '').toLowerCase() === 'production';

module.exports.isCI = () => !!(
  process.env.CONTINUOUS_INTEGRATION ||
  process.env.BUILD_NUMBER ||
  false
);

module.exports.utilsTestkit = require('./utils-testkit');
