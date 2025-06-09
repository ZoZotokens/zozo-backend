function getClientIP(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // اگر چند IP هست، اولین IP واقعی رو برمی‌گردونه
    return xForwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress || null;
}

module.exports = { getClientIP };

