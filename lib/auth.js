const crypto = require('crypto');

const COOKIE_NAME = 'upb_access';
const COOKIE_DAYS = 30;

function secretKey() {
  const secret = process.env.LICENSE_COOKIE_SECRET || '';
  if (secret.length < 32) throw new Error('LICENSE_COOKIE_SECRET must be at least 32 characters.');
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptLicense(licenseKey) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(licenseKey, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

function decryptLicense(token) {
  try {
    const input = Buffer.from(token, 'base64url');
    if (input.length < 29) return null;
    const iv = input.subarray(0, 12);
    const tag = input.subarray(12, 28);
    const encrypted = input.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch (_) {
    return null;
  }
}

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function licenseFromRequest(req) {
  return decryptLicense(parseCookies(req)[COOKIE_NAME] || '');
}

function accessCookie(licenseKey) {
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  return `${COOKIE_NAME}=${encodeURIComponent(encryptLicense(licenseKey))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function verifyGumroadLicense(licenseKey, incrementUses = false) {
  const productId = process.env.GUMROAD_PRODUCT_ID || '';
  if (!productId) throw new Error('GUMROAD_PRODUCT_ID is not configured.');
  const body = new URLSearchParams({
    product_id: productId,
    license_key: licenseKey,
    increment_uses_count: incrementUses ? 'true' : 'false'
  });
  const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await response.json().catch(() => ({}));
  const purchase = data.purchase || {};
  const invalidated = purchase.refunded || purchase.chargebacked || purchase.disputed;
  return { valid: Boolean(response.ok && data.success && !invalidated), data };
}

module.exports = {
  accessCookie,
  clearCookie,
  licenseFromRequest,
  verifyGumroadLicense
};
