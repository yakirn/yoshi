'use strict';

const path = require('path');
const graphite = require('graphite-tcp');
const fs = require('fs');
const glob = require('glob');

const fsStatP = filePath => new Promise((resolve, reject) => {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      reject(err);
    } else {
      resolve(stats);
    }
  });
});

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

const command = ({appName, bundleName}) => {
  const metricNames = {
    app_name: replaceDotsWithUnderscore(appName), // eslint-disable-line camelcase
    bundle_name: replaceDotsWithUnderscore(path.relative(path.join(process.cwd(), 'dist/statics'), bundleName)), // eslint-disable-line camelcase
  };

  const metricNamesSeparator = '.';
  const bundleSizeMetricName = 'bundle_size';

  return ''.concat(
    Object.keys(metricNames).map(key => `${key}=${metricNames[key]}`).join(metricNamesSeparator),
    metricNamesSeparator,
    `${bundleSizeMetricName}`
  );
};

const reportBundleSize = params => {
  return new Promise(resolve => {
    return fsStatP(path.resolve(process.cwd(), params.bundleName))
      .then(stats => {
        const metric = graphite.createClient({
          host: 'm.wixpress.com',
          port: 2003,
          prefix: 'wix-bi-tube.root=events_catalog.src=72',
          callback: () => {
            resolve();
            metric.close();
          }
        });
        metric.put(command(params), stats.size || 0);
      })
      .catch(err => {
        console.warn(`Error code ${err.code}. Failed to find size of file ${params.bundleName}.bundle.min.js.`);
        resolve();
      });
  });
};

const reportBundleForApp = bundleName => fedopsJson => {
  const appName = fedopsJson.app_name || fedopsJson.appName;
  const params = {
    appName,
    bundleName
  };

  if (!appName) {
    console.warn('fedops.json is missing "app_name" field');
    return Promise.resolve();
  }

  return reportBundleSize(params);
};

const sendStream = config => bundleName => {
  const promises = [].concat(config).map(reportBundleForApp(bundleName));
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
        return Promise.all(bundleNames.map(sendStream(config)));
      })
      .catch(e => {
        console.warn('Bundle size report error:', e);
        return Promise.resolve();
      });
  }

  return log(fedopsBundleSize);
};
