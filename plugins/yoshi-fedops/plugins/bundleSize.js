'use strict';

const path = require('path');
const shelljs = require('shelljs');
const fs = require('fs');

const tryRequire = name => {
  try {
    return require(name);
  } catch (ex) {
    return null;
  }
};

const isSingleEntry = entry => typeof entry === 'string' || Array.isArray(entry);

const getBundleNames = config => {
  const {defaultEntry, entry: customEntry} = config;
  const entryGetter = customEntry || defaultEntry;
  const entry = entryGetter();
  return isSingleEntry(entry) ? 'app' : Object.keys(entry);
};

const replaceDotsWithUnderscore = str => str.replace(/\./g, '_');

const command = ({appName, bundleName, bundleSize, timestamp}) => {
  const args = {
    'wix-bi-tube.root': 'events_catalog',
    src: '72',
    app_name: replaceDotsWithUnderscore(appName), // eslint-disable-line camelcase
    bundle_name: replaceDotsWithUnderscore(bundleName), // eslint-disable-line camelcase
    bundle_size: bundleSize // eslint-disable-line camelcase
  };

  return ''.concat(
    'echo `',
    Object.keys(args).map(key => `${key}=${args[key]}`).join('.'),
    ' ',
    timestamp,
    '` | nc -q0 m.wixpress.com 2003'
  );
};

const shellExec = (config, timestamp) => bundleName => {
  return new Promise(resolve => {
    fs.stat(path.resolve(process.cwd(), `dist/${bundleName}.bundle.min.js`), (err, stats) => {
      if (!err) {
        const bundleSize = stats.size;
        const params = {
          appName: config.app_name,
          bundleName,
          bundleSize,
          timestamp
        };
        shelljs.exec(command(params), resolve);
        return;
      }
      console.warn(`Error code ${err.code}. Failed to find size of file ${bundleName}.bundle.min.js.`);
      resolve();
    });
  });
};

module.exports = ({log, inTeamCity, projectConfig}) => {
  function fedopsBundleSize() {
    if (!inTeamCity()) {
      return Promise.resolve();
    }

    const config = tryRequire(path.join(process.cwd(), 'fedops.json'));

    if (!config) {
      return Promise.resolve();
    }

    let promises = [];

    try {
      let fileName = getBundleNames(projectConfig);
      fileName = Array.isArray(fileName) ? fileName : [fileName];
      promises = fileName.map(shellExec(config, Date.now()));
    } catch (e) {
      console.warn('Bundle size report error:', e);
      return Promise.resolve();
    }

    return log(Promise.all(promises));
  }

  return fedopsBundleSize;
};
