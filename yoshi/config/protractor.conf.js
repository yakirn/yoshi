'use strict';
const {tryRequire} = require('../lib/utils');


//Private wix applitools key
//skip wix' key for applitools
//In case you want to use applitools & eyes.it (https://github.com/wix/eyes.it)
//in your project, please use your own key
tryRequire('../private/node_modules/wix-eyes-env');

// Private Wix environment config for screenshot reporter
// Read how to set your own params (if needed) here: https://github.com/wix/screenshot-reporter#usage
tryRequire('../private/node_modules/screenshot-reporter-env');


require('../lib/require-hooks');
const path = require('path');
const ld = require('lodash');
const exists = require('../lib/utils').exists;
const inTeamCity = require('../lib/utils').inTeamCity;
const {start} = require('../lib/server-api');
const globs = require('../lib/globs');

const userConfPath = path.resolve('protractor.conf.js');
const userConf = exists(userConfPath) ? require(userConfPath).config : null;

const beforeLaunch = (userConf && userConf.beforeLaunch) || ld.noop;
const afterLaunch = (userConf && userConf.afterLaunch) || ld.noop;

let cdnServer;

const merged = ld.mergeWith({
  framework: 'jasmine',
  specs: [globs.e2e()],
  directConnect: true,

  beforeLaunch: () => {
    const rootDir = './src';
    require('css-modules-require-hook')({
      rootDir,
      generateScopedName: require('./css-scope-pattern'),
      extensions: ['.scss', '.css'],
      camelCase: true
    });

    if (merged.framework === 'jasmine' && inTeamCity()) {
      const TeamCityReporter = require('jasmine-reporters').TeamCityReporter;
      jasmine.getEnv().addReporter(new TeamCityReporter());
    }

    try {
      const ScreenshotReporter = require('screenshot-reporter');
      jasmine.getEnv().addReporter(new ScreenshotReporter());
    } catch (e) {}

    return start({host: 'localhost'}).then(server => {
      cdnServer = server;
      return beforeLaunch.call(merged);
    });
  },
  afterLaunch: () => {
    if (cdnServer) {
      cdnServer.close();
    }
    afterLaunch(merged);
  },
  mochaOpts: {
    timeout: 30000
  }
}, userConf, a => typeof a === 'function' ? a : undefined);

if (merged.framework === 'mocha') {
  merged.mochaOpts.reporter = inTeamCity() ? 'mocha-teamcity-reporter' : 'mocha-env-reporter';
}

function normaliseSpecs(config) {
  const specs = [].concat(config.specs || []);
  return Object.assign({}, config, {specs: specs.map(spec => path.resolve(spec))});
}

module.exports.config = normaliseSpecs(merged);
