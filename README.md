<h1 align="center">
<img width="241" src ="yoshi/media/yoshi_logo-sm.png" />
<br>
yoshi
</h1>

[![Build Status](https://travis-ci.org/wix/yoshi.svg?branch=master)](https://travis-ci.org/wix/yoshi)

> A tool for common tasks in Javascript projects.

## Features

* Transpile to ES6/Typescript
* Support React/Angular 1.x (2.0 will be supported soon)
* Browser tests using protractor / Selenium Webdriver
* Unit tests using Jest/Mocha/karma
* ESlint/TSlint
* CSS Modules
* Sass
* Local dev environment running node server / cdn server
* [Wallaby](https://wallabyjs.com/)
* async/await (`babel-polyfill` needed)
* Minify/Uglify
* Bundle JS/CSS using Webpack
* External/Inline css
* Webpack 2 (tree shaking)
* HMR

## Install

```bash
npm install --save-dev yoshi
```

## Sample usage

In your `package.json`:

```js
{
  "scripts": {
    "start": "yoshi start",
    "pretest": "yoshi lint && yoshi build", 
    "test": "yoshi test",
    "build": ":",
    "release": "yoshi release" //only needed if you publish to npm
    ...
  }
}
```

Or within the command-line:

```console
yoshi [command] [options]
```

## Generators

For a quick start, take a look at our [generators](https://github.com/wix/yoshi/tree/master/generators/generator-yoshi):

```bash
npm install -g yo
npm install -g generator-yoshi
```

Then generate your new project:

```bash
yo yoshi
```

---

## CLI

The following sections describe the available tasks in `yoshi`. You can always use the `--help` flag for every task to see its usage.

### start

Flag | Short Flag | Description | Default Value
---- | ---------- | ----------- | --------------
--entry-point | -e | Entry point for the app. | `./dist/index.js`

This will run the specified (server) `entryPoint` file and mount a CDN server.

The following are the default values for the CDN server's port and the mount directory. You can change them in your `package.json`:

```json
"yoshi": {
  "servers": {
    "cdn": {
      "port": 3200,
      "dir": "dist/statics"
    }
  }
}
```

### build

Flag | Short Flag | Description | Default Value
---- | ---------- | ----------- | ------------
--output <dir> | | The output directory for static assets. | `statics`

This task will perform the following:

1. Compile using `TypeScript` (`*.ts`) or `babel` (`*.js`) files into `dist/`. In case you do not want to transpile server (node), you can remove `.babelrc`/`tsconfig`/package json's `babel` key. If you still need those (for transpiling client code), please use `yoshi.runIndividualTranspiler`.
2. Copy assets to `dist` folder (ejs/html/images...).

You can specify multiple entry points in your `package.json` file. This gives the ability build multiple bundles at once. More info about Webpack entries can be found [here](http://webpack.github.io/docs/configuration.html#entry).

```json
"yoshi": {
  "entry": {
    "a": "./a",
    "b": "./b",
    "c": ["./c", "./d"]
  }
}
```

**Note:** the decision whether to use `TypeScript` or `babel` is done by searching `tsconfig.json` inside the root directory.

### test

Flag | Description
---- | -----------
--mocha | Run unit tests with Mocha - this is the default
--jasmine | Run unit tests with Jasmine
--karma | Run tests with Karma (browser)
--jest | Run tests with Jest
--protractor | Run e2e tests with Protractor (e2e)

By default, this task executes both unit test (using `mocha` as default) and e2e test using `protractor`.
Default unit test glob is `{test,app,src}/**/*.spec.+(js|ts)`. You can change this by adding the following to your package.json:

```js
yoshi: {
  specs: {
    node: 'my-crazy-tests-glob-here'
  }
}
```

* Note that when specifying multiple flags, only the first one will be considered, so you can't compose test runners (for now).

* Mocha tests setup:

  You can add a `test/mocha-setup.js` file, with mocha tests specific setup. Mocha will `require` this file, if exists.
  Example for such `test/mocha-setup.js`:

  ```js
  import 'babel-polyfill';
  import 'isomorphic-fetch';
  import sinonChai from 'sinon-chai';
  import chaiAsPromised from 'chai-as-promised';
  import chai from 'chai';

  chai.use(sinonChai);
  chai.use(chaiAsPromised);
  ```

* Karma tests setup:

  When running tests using Karma, make sure you have the right configurations in your `package.json` as described in [`yoshi.specs`](#wixspecs) section. In addition, if you have a `karma.conf.js` file, the configurations will be merged with our [built-in configurations](config/karma.conf.js).

### lint

Flag | Short Flag | Description
---- | ---------- | -----------

Executes `TSLint` or `ESLint` (depending on the type of the project) over all matched files. An '.eslintrc' / `tslint.json` file with proper configurations is required.

### release

Bump `package.json` version and publish to npm using `wnpm-release`.

---

## Configurations

Configurations are meant to be inside `package.json` under `yoshi` section or by passing flags to common tasks.

### Flags

See above sections.

### Configurations in `package.json`

##### yoshi.separateCss

By default, your `require`d css will bundled to a separate `app.css` bundle. You can leave your css in main js bundle by adding the following to your `package.json`:

  ```json
  "yoshi": {
    "separateCss": false
  }
  ```

##### yoshi.cssModules

We use [css modules](https://github.com/css-modules/css-modules) as default. You can disable this option any time by adding the following to wix section inside your `package.json`:

  ```json
  "yoshi": {
    "cssModules": false
  }
  ```

  Using css modules inside your component is easy:

  ```js
  import s from './Counter.scss';//import css/scss

  <p className={s.mainColor}>{counterValue}</p>
  ```

  Using css when css modules are turned off:

  ```js
  import './Counter.scss';//import css/scss

  <p className="mainColor">{counterValue}</p>
  ```

##### yoshi.entry

Explanation is in [cli/build](#build) section.

##### yoshi.servers.cdn

Explanation is in [cli/start](#start) section.

##### yoshi.externals

Prevent bundling of certain imported packages and instead retrieve these external dependencies at runtime (as a script tags)

```json
{
  "yoshi": {
    "externals": {
      "react": "React"
    }
  }
}
```

##### yoshi.specs

Specs globs are configurable. `browser` is for karma, `node` is for mocha and jasmine.

```json
{
  "yoshi": {
    "specs": {
      "browser": "dist/custom/globs/**/*.spec.js",
      "node": "dist/custom/globs/**/*.spec.js"
    }
  }
}
```

For example:

```json
{
  "yoshi": {
    "specs": {
      "browser": "dist/src/client/**/*.spec.js",
      "node": "dist/src/server/**/*.spec.js"
    }
  }
}
```

##### yoshi.runIndividualTranspiler

In case you don't want to transpile your server (node) code, and you still need `.babelrc`/`tsconfig`, you can add `runIndividualTranspiler` flag to skip server transpiling.

##### yoshi.externalUnprocessedModules

You can explicitly ask build process to transpile some node modules in case those modules do not contain transpiled code.
Note that this is not a recommended workflow. It can be very error prone:
 1. It might be for example that your app babel config and the node module babel config will be conflicting.
 2. Any babel plugin that is used by your dependencies will need to be installed by your app as well.
 3. You'll need to also add nested dependencies that need transpiling into array, which can be confusing.

Anyway, if you don't have a better alternative you can pass array with module names in this property.

##### yoshi.exports

If set, export the bundle as library. `yoshi.exports` is the name.

Use this if you are writing a library and want to publish it as single file. Library will be exported with `UMD` format.

## FAQ
- [How do I debug my application/tests?](docs/faq/DEBUGGING.md)
- [How to add external assets to my client part of the project?](docs/faq/ASSETS.md)
- [How do I setup Enzyme test environment?](docs/faq/SETUP-TESTING-WITH-ENZYME.md)
- [How to disable css modules in specific places](docs/faq/DISABLE-SPECIFIC-CSS-MODULES.md)
- [How to I analyze my webpack bundle contents](docs/faq/WEBPACK-ANALYZE.md)
