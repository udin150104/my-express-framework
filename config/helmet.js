const helmet = require('helmet');
const csp = require('./csp');

module.exports = [
  helmet(),
  helmet.contentSecurityPolicy(csp)
];
