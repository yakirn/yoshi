'use strict';

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {mergeByConcat, isSingleEntry, inTeamCity} = require('../lib/utils');
const webpackConfigCommon = require('./webpack.config.common');
const projectConfig = require('./project');
const DynamicPublicPath = require('../lib/plugins/dynamic-public-path');

const config = ({debug, separateCss = projectConfig.separateCss()} = {}) => {
  const cssModules = projectConfig.cssModules();
  const tpaStyle = projectConfig.tpaStyle();

  return mergeByConcat(webpackConfigCommon, {
    entry: getEntry(),

    module: {
      rules: [
        require('../lib/loaders/sass')(separateCss, cssModules, tpaStyle).client,
        require('../lib/loaders/less')(separateCss, cssModules, tpaStyle).client
      ]
    },

    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: !debug
      }),

      new DynamicPublicPath(),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': debug ? '"development"' : '"production"'
      }),

      ...!separateCss ? [] : [
        new ExtractTextPlugin(debug ? '[name].css' : '[name].min.css')
      ],

      ...debug ? [] : [
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true,
          compress: {
            warnings: false,
          },
        })
      ]
    ],

    devtool: inTeamCity() ? 'source-map' : 'cheap-module-source-map',

    output: {
      umdNamedDefine: true,
      path: path.resolve('./dist/statics'),
      filename: debug ? '[name].bundle.js' : '[name].bundle.min.js',
      chunkFilename: debug ? '[name].chunk.js' : '[name].chunk.min.js',
      pathinfo: debug
    },

    target: 'web'
  });
};

function getEntry() {
  const entry = projectConfig.entry() || projectConfig.defaultEntry();
  return isSingleEntry(entry) ? {app: entry} : entry;
}

module.exports = config;
