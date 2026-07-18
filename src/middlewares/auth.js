const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Protège les routes nécessitant une authentification en vérifiant l'access token.
function requireAuth(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: 'Non authentifié.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

// Limite les tentatives sur les routes sensibles (login, register) pour se protéger
// contre le brute-force et le credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez plus tard.' },
});

module.exports = { requireAuth, authLimiter };
