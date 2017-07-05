module.exports.isProduction = () => (process.env.NODE_ENV || '').toLowerCase() === 'production';
