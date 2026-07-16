const fs = require('fs');
const path = require('path');
const { licenseFromRequest, verifyGumroadLicense } = require('../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'GET') return res.status(405).send('Method not allowed.');

  const licenseKey = licenseFromRequest(req);
  if (!licenseKey) return res.redirect(302, '/?access=required');

  try {
    const result = await verifyGumroadLicense(licenseKey, false);
    if (!result.valid) return res.redirect(302, '/?access=invalid');
    const file = path.join(process.cwd(), 'private', 'Ultimate-Promo-Builder.html');
    const html = fs.readFileSync(file, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Builder access error:', error.message);
    return res.status(503).send('The builder is temporarily unavailable. Please try again shortly.');
  }
};
