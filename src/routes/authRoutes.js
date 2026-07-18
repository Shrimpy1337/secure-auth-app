const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth, authLimiter } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Exemple de route protégée : accessible uniquement avec un access token valide.
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ userId: req.userId });
});

module.exports = router;
