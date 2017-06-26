'use strict';
const sinonChai = require('sinon-chai');
const chai = require('chai');
const intercept = require('intercept-stdout');
const tp = require('test-phases');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
chai.use(sinonChai);
const {expect} = chai;

const shellExecSpy = sinon.spy((str, cb) => {
  cb(str);
});
const fedopsBundleSize = proxyquire('../plugins/bundleSize', {
  'shelljs': {exec: shellExecSpy}
});

const APP_NAME = 'your-unique-app-name'; // eslint-disable-line camelcase
const fedopsJson = JSON.stringify({
  app_name: APP_NAME
}, null, 2);

describe('measure bundle size', () => {
  const timestamp = (new Date('2017-06-26')).getTime();
  const someFileContent = `console.log('hello world');`;
  const someOtherFileContent = `console.log('foo bar');`;
  const bundleSize = content => content.length + 1;
  let clock;
  let test;

  const createTask = (options = {}) => {
    const {projectConfig} = options;
    const rest = Object.assign({}, options);
    delete rest.projectConfig;

    const defaults = {
      log: a => a,
      inTeamCity: () => true,
      projectConfig: Object.assign({defaultEntry: () => 'src/index.js'}, projectConfig),
    };

    return fedopsBundleSize(Object.assign({}, defaults, rest));
  };

  const output = (bundleName, fileContent) => {
    return `echo \`wix-bi-tube.root=events_catalog.src=72.app_name=${APP_NAME}.bundle_name=${bundleName}.bundle_size=${bundleSize(fileContent)} ${timestamp}\` | nc -q0 m.wixpress.com 2003`;
  }

  beforeEach(() => {
    test = tp.create();
    process.chdir(test.tmp);
    clock = sinon.useFakeTimers(timestamp);
  });

  afterEach(() => {
    test.teardown();
    shellExecSpy.reset();
    clock.restore();
  });

  it('should\'nt do anything if not in team city', () => {
    test.setup({
      'dist/app.bundle.min.js': someFileContent,
      'fedops.json': fedopsJson
    });
    const task = createTask({inTeamCity: () => false});
    return task().then(() => {
      expect(shellExecSpy).to.have.been.notCalled;
    });
  });

  it('should\'nt do anything if no fedops config found', () => {
    test.setup({
      'dist/app.bundle.min.js': someFileContent
    });
    const task = createTask({inTeamCity: () => false});
    return task().then(() => {
      expect(shellExecSpy).to.have.been.notCalled;
    });
  });

  it('should report the size off app.bundle.min given no entry point', () => {
    test.setup({
      'dist/app.bundle.min.js': someFileContent,
      'fedops.json': fedopsJson
    });
    const task = createTask();
    return task().then(() => {
      expect(shellExecSpy).to.have.been.calledOnce;
      expect(shellExecSpy).to.have.been.calledWith(output('app', someFileContent));
    });
  });

  it('should report the size off app.bundle.min given a string entry point', () => {
    test.setup({
      'dist/app.bundle.min.js': someFileContent,
      'fedops.json': fedopsJson
    });
    const task = createTask({projectConfig: {entry: () => 'src/index2.js'}});
    return task().then(() => {
      expect(shellExecSpy).to.have.been.calledOnce;
      expect(shellExecSpy).to.have.been.calledWith(output('app', someFileContent));
    });
  });

  it('should report the size off app.bundle.min given a string entry point', () => {
    test.setup({
      'dist/app.bundle.min.js': someFileContent,
      'fedops.json': fedopsJson
    });
    const task = createTask({projectConfig: {entry: () => ['src/index2.js', 'src/index3.js']}});
    return task().then(() => {
      expect(shellExecSpy).to.have.been.calledOnce;
      expect(shellExecSpy).to.have.been.calledWith(output('app', someFileContent));
    });
  });

  it('should report the size of all keys in entry object', () => {
    const entry = {
      a: 'src/a.js',
      b: 'src/b.js'
    };
    test.setup({
      'dist/a.bundle.min.js': someFileContent,
      'dist/b.bundle.min.js': someOtherFileContent,
      'fedops.json': fedopsJson
    });
    const task = createTask({projectConfig: {entry: () => entry}});
    return task().then(() => {
      expect(shellExecSpy).to.have.been.calledTwice;
      expect(shellExecSpy.getCall(0).args[0]).to.equal(output('a', someFileContent));
      expect(shellExecSpy.getCall(1).args[0]).to.equal(output('b', someOtherFileContent));
    });
  });

  it('should not report a non existing bundle', () => {
    const entry = {
      a: 'src/a.js',
      b: 'src/b.js'
    };
    test.setup({
      'dist/b.bundle.min.js': someFileContent,
      'fedops.json': fedopsJson
    });
    const task = createTask({projectConfig: {entry: () => entry}});
    return task().then(() => {
      expect(shellExecSpy).to.have.been.calledOnce;
      expect(shellExecSpy).to.have.been.calledWith(output('b', someFileContent));
    });
  });
});
