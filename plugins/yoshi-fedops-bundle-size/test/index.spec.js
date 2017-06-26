'use strict';

// const {expect} = require('chai');
const stripAnsi = require('strip-ansi');
const intercept = require('intercept-stdout');
const tp = require('test-phases');
const mockBin = require('mock-bin');
const fedopsSync = require('../index');

describe('measure bundle size', () => {
  let test;
  let cleanup;
  let stdout;

  const createTask = options => {
    const defaults = {
      inTeamCity: () => true,
      projectConfig: {defaultEntry: () => 'src/index.js'},
    };

    return fedopsSync(Object.assign({}, defaults, options));
  };

  before(() => cleanup = intercept(s => {
    stdout += stripAnsi(s);
  }));
  beforeEach(() => test = tp.create());
  beforeEach(() => process.chdir(test.tmp));

  afterEach(() => test.teardown());
  afterEach(() => stdout = '');
  after(() => cleanup());

  it('should report the size off app.bundle.min given no entry point', async () => {
    test.setup({
      'dist/app.bundle.min.js': `
        console.log('hello world);
      `
    });
    const unmock = await mockBin('echo', 'node', 'console.log(arguments)');
    const task = createTask();
    task().then(() => {

    });
  });
});
