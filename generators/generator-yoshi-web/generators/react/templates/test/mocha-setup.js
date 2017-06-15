import 'babel-polyfill';

process.on('unhandledRejection', reason => {
  throw reason;
});
