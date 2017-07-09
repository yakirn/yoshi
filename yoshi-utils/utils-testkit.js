let originalEnv = Object.assign({}, process.env);
const mockery = require('mockery');
module.exports.cleanMocks = () => {
  process.env = originalEnv;
  mockery.disable();
  mockery.deregisterAll();
};

module.exports.mockProduction = (isProduction = true) => {
  if (isProduction) {
    process.env.NODE_ENV = 'production';
  } else {
    delete process.env.NODE_ENV;
  }
};

module.exports.mockCI = (isCI = true) => {
  mockery.enable();
  mockery.registerMock('is-ci', isCI);
};
