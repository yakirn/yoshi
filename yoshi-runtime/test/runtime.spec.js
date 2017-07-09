const {expect} = require('chai');
const {cssModulesPattren} = require('../index');
const {cleanMocks, mockEnvironment, mockCI} = require('yoshi-utils').utilsTestkit;

describe('CSS modules pattern', () => {
  afterEach(() => {
    cleanMocks();
  });

  it('should return short pattern for production mode', () => {
    mockEnvironment({production: true});
    mockCI({ci: false});
    expect(cssModulesPattren()).to.equal(`[hash:base64:5]`);
  });

  it('should return short pattern for local mode', () => {
    mockEnvironment({production: false});
    mockCI({ci: false});
    expect(cssModulesPattren()).to.equal(`[path][name]__[local]__[hash:base64:5]`);
  });

  it('should return short pattern in CI', () => {
    mockEnvironment({production: false});
    mockCI({ci: true});
    expect(cssModulesPattren()).to.equal(`[hash:base64:5]`);
  });
});
