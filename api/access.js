const { accessCookie, verifyGumroadLicense } = require('../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed.' });

  const licenseKey = String((req.body || {}).licenseKey || '').trim();
  if (licenseKey.length < 8 || licenseKey.length > 200) {
    return res.status(400).json({ ok: false, message: 'Please enter the license key from your Gumroad receipt.' });
  }

  try {
    const result = await verifyGumroadLicense(licenseKey, true);
    if (!result.valid) return res.status(401).json({ ok: false, message: 'That license key could not be verified. Check the key and try again.' });
    res.setHeader('Set-Cookie', accessCookie(licenseKey));
    return res.status(200).json({ ok: true, redirect: '/app' });
  } catch (error) {
    console.error('License verification error:', error.message);
    return res.status(503).json({ ok: false, message: 'License verification is temporarily unavailable. Please try again shortly.' });
  }
};
