let oldEnv = process.env;
module.exports.cleanMocks = () => {
  process.env = oldEnv;
};

module.exports.mockProduction = (isProduction = true) => {
  if (isProduction) {
    process.env.NODE_ENV = 'production';
  } else {
    delete process.env.NODE_ENV;
  }
};
