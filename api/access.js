const { accessCookie, verifyGumroadLicense } = require('../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed.'
    });
  }

  const licenseKey = String(
    (req.body || {}).licenseKey || ''
  ).trim();

  if (licenseKey.length < 8 || licenseKey.length > 200) {
    return res.status(400).json({
      ok: false,
      message: 'Please enter the license key from your Gumroad receipt.'
    });
  }

  try {
    const result = await verifyGumroadLicense(licenseKey, true);

    if (!result.valid) {
      const gumroadMessage = String(
        result.data?.message || result.data?.error || ''
      ).slice(0, 240);

      console.error(
        'Gumroad license rejected:',
        JSON.stringify({
          httpStatus: result.status,
          success: Boolean(result.data?.success),
          message: gumroadMessage || 'No message returned',
          refunded: Boolean(result.data?.purchase?.refunded),
          disputed: Boolean(result.data?.purchase?.disputed),
          chargebacked: Boolean(result.data?.purchase?.chargebacked)
        })
      );

      const detail = gumroadMessage
        ? ` Gumroad says: ${gumroadMessage}`
        : ` Gumroad returned HTTP ${result.status}.`;

      return res.status(401).json({
        ok: false,
        message: `That license key could not be verified.${detail}`
      });
    }

    res.setHeader('Set-Cookie', accessCookie(licenseKey));

    return res.status(200).json({
      ok: true,
      redirect: '/app'
    });
  } catch (error) {
    console.error('License verification error:', error.message);

    return res.status(503).json({
      ok: false,
      message:
        'License verification is temporarily unavailable. Please try again shortly.'
    });
  }
};
