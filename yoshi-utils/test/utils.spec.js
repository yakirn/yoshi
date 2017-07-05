const {expect} = require('chai');
const {isProduction} = require('../index');

describe('Yoshi Utils', () => {
  describe('isProduction', () => {
    let originalNodeEnv;
    beforeEach(() => originalNodeEnv = process.env.NODE_ENV);
    afterEach(() => process.env.NODE_ENV = originalNodeEnv);

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
});
