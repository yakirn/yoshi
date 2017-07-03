'use strict';
const {inTeamCity, isProduction} = require('../lib/utils');

const productionPattern = `[hash:base64:5]`;
const devPattern = `[path][name]__[local]__${productionPattern}`;

module.exports = (inTeamCity() || isProduction()) ? productionPattern : devPattern;
