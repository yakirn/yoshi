'use strict';

const path = require('path');
const {exec} = require('child_process');
const fs = require('fs');
const glob = require('glob');

const tryRequire = name => {
  try {
    return require(name);
  } catch (ex) {
    return null;
  }
};

const globAsync = (patter, options) => new Promise((resolve, reject) => {
  glob(patter, options, (err, matches) => {
    if (err) {
      reject(err);
      return;
    }

    resolve(matches);
  });
});

const getBundleNames = () => {
  return globAsync(path.resolve(process.cwd(), 'dist/statics/*.min.@(js|css)'));
};

const replaceDotsWithUnderscore = str => str.replace(/\./g, '_');

const command = ({appName, bundleName, bundleSize, timestamp}) => {
  const metricNames = {
    'wix-bi-tube.root': 'events_catalog',
    src: '72',
    app_name: replaceDotsWithUnderscore(appName), // eslint-disable-line camelcase
    bundle_name: replaceDotsWithUnderscore(path.relative(path.join(process.cwd(), 'dist/statics'), bundleName)), // eslint-disable-line camelcase
  };

  const metricNamesSeperator = '.';
  const bundleSizeMetricName = 'bundle_size';

  return ''.concat(
    'echo `',
    Object.keys(metricNames).map(key => `${key}=${metricNames[key]}`).join(metricNamesSeperator),
    metricNamesSeperator,
    `${bundleSizeMetricName} ${bundleSize}`,
    ' ',
    timestamp,
    '` | nc -q0 m.wixpress.com 2003'
  );
};

const shellExec = (config, timestamp) => bundleName => {
  const promises = [].concat(config).map(fedopsJson => {
    return new Promise(resolve => {
      fs.stat(path.resolve(process.cwd(), bundleName), (err, stats) => {
        if (!err) {
          const bundleSize = stats.size;
          const params = {
            appName: fedopsJson.app_name || fedopsJson.appName,
            bundleName,
            bundleSize,
            timestamp
          };
          if (params.appName) {
            exec(command(params), resolve);
          } else {
            console.warn('fedops.json is missing "app_name" field');
            resolve();
          }
          return;
        }
        console.warn(`Error code ${err.code}. Failed to find size of file ${bundleName}.bundle.min.js.`);
        resolve();
      });
    });
  });
  return Promise.all(promises);
};

module.exports = ({log, inTeamCity}) => {
  function fedopsBundleSize() {
    if (!inTeamCity()) {
      return Promise.resolve();
    }

    const config = tryRequire(path.join(process.cwd(), 'fedops.json'));

    if (!config) {
      return Promise.resolve();
    }

    return getBundleNames()
        .then(bundleNames => {
          return Promise.all(bundleNames.map(shellExec(config, Math.floor(Date.now() / 1000))));
        })
        .catch(e => {
          console.warn('Bundle size report error:', e);
          return Promise.resolve();
        });
  }

  return log(fedopsBundleSize);
};
