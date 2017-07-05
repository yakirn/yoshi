const {isProduction, isCI} = require('yoshi-utils');

module.exports.cssModulesPattren = () => (isProduction() || isCI()) ? `[hash:base64:5]` : `[path][name]__[local]__[hash:base64:5]`;
