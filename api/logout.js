const { clearCookie } = require('../lib/auth');

module.exports = function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie());
  res.redirect(302, '/');
};
