const {expect} = require('chai');
const {isProduction, isCI} = require('../index');

describe('Yoshi Utils', () => {
  let originalEnv;
  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
  });
  afterEach(() => process.env = originalEnv);

  describe('isProduction', () => {
    it('should return true', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).to.equal(true);
    });

    it('should return false', () => {
      delete process.env.NODE_ENV;
      expect(isProduction()).to.equal(false);
    });

    it('should handle upper case strings', () => {
      process.env.NODE_ENV = 'Production';
      expect(isProduction()).to.equal(true);
    });
  });

  describe('Is CI', () => {
    it('should return true for TC', () => {
      process.env.BUILD_NUMBER = true;
      expect(isCI()).to.equal(true);
    });

    it('should return true for Travis', () => {
      process.env.CONTINUOUS_INTEGRATION = true;
      expect(isCI()).to.equal(true);
    });

    it('should return false for non CI', () => {
      delete process.env.CONTINUOUS_INTEGRATION;
      delete process.env.BUILD_NUMBER;
      expect(isCI()).to.equal(false);
    });
  });
});
