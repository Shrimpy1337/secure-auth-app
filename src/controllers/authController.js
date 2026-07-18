const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Options communes des cookies : HttpOnly empêche l'accès en JS (protection contre le vol
// de token via XSS), SameSite=Strict limite les envois cross-site (protection CSRF).
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email invalide.' });
    }
    if (!password || password.length < 10) {
      return res
        .status(400)
        .json({ error: 'Le mot de passe doit contenir au moins 10 caractères.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      // Message volontairement générique pour ne pas confirmer qu'un email existe déjà
      // (évite l'énumération de comptes).
      return res.status(409).json({ error: "Impossible de créer ce compte." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, passwordHash });

    return res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email });
    // Message identique que l'utilisateur existe ou non, pour ne pas donner d'indice
    // à un attaquant sur les comptes existants.
    const invalidMsg = { error: 'Identifiants invalides.' };

    if (!user) return res.status(401).json(invalidMsg);

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json(invalidMsg);

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // On ne stocke jamais le refresh token en clair, seulement son hash.
    user.refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await user.save();

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    return res.status(200).json({ id: user._id, email: user.email });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'Non authentifié.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Session expirée.' });
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ error: 'Session invalide.' });
    }

    const isValid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isValid) return res.status(401).json({ error: 'Session invalide.' });

    // Rotation du refresh token : on en génère un nouveau à chaque refresh, l'ancien
    // devient inutilisable même s'il a été intercepté.
    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await user.save();

    res.cookie('accessToken', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    return res.status(200).json({ message: 'Token rafraîchi.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
      } catch {
        // Token déjà invalide : rien à révoquer côté serveur, on nettoie juste les cookies.
      }
    }
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    return res.status(200).json({ message: 'Déconnecté.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
};
