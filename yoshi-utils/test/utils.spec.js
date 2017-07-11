const {expect} = require('chai');
const mockery = require('mockery');

describe('Yoshi Utils', () => {
  describe('isProduction', () => {
    let originalEnv;
    beforeEach(() => {
      delete require.cache[require.resolve('../index')];
      originalEnv = Object.assign({}, process.env);
    });
    afterEach(() => process.env = originalEnv);

    it('should return true', () => {
      process.env.NODE_ENV = 'production';
      const {isProduction} = require('../index');
      expect(isProduction).to.equal(true);
    });

    it('should return false', () => {
      delete process.env.NODE_ENV;
      const {isProduction} = require('../index');
      expect(isProduction).to.equal(false);
    });

    it('should handle upper case strings', () => {
      process.env.NODE_ENV = 'Production';
      const {isProduction} = require('../index');
      expect(isProduction).to.equal(true);
    });
  });
  describe('Is CI', () => {
    beforeEach(() => {
      delete require.cache[require.resolve('../index')];
      mockery.enable({
        warnOnUnregistered: false
      });
    });
    afterEach(() => {
      mockery.disable();
      mockery.deregisterAll();
    });

    it('should return true', () => {
      mockery.registerMock('is-ci', true);
      const {isCI} = require('../index');
      expect(isCI).to.equal(true);
    });

    it('should return false', () => {
      mockery.registerMock('is-ci', false);
      const {isCI} = require('../index');
      expect(isCI).to.equal(false);
    });
  });
});
