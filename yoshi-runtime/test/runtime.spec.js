const {expect} = require('chai');
const {cssModulesPattren} = require('../index');
const {cleanMocks, mockProduction, mockCI} = require('yoshi-utils').utilsTestkit;

describe('CSS modules pattern', () => {
  afterEach(() => {
    cleanMocks();
  });

  it('should return short pattern for production mode', () => {
    mockProduction(true);
    mockCI(false);
    expect(cssModulesPattren()).to.equal(`[hash:base64:5]`);
  });

  it('should return short pattern for local mode', () => {
    mockProduction(false);
    mockCI(false);
    expect(cssModulesPattren()).to.equal(`[path][name]__[local]__[hash:base64:5]`);
  });

  it('should return short pattern in CI', () => {
    mockCI(true);
    mockProduction(false);
    expect(cssModulesPattren()).to.equal(`[hash:base64:5]`);
  });
});
