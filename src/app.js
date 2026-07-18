require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const xssClean = require('xss-clean');

const authRoutes = require('./routes/authRoutes');

const app = express();

// --- Protections de sécurité globales ---
app.use(helmet()); // en-têtes HTTP sécurisés (CSP, X-Frame-Options, etc.)
app.use(xssClean()); // nettoie les entrées pour limiter les injections XSS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, // nécessaire pour envoyer/recevoir les cookies HttpOnly
  })
);
app.use(express.json({ limit: '10kb' })); // limite la taille du payload (anti-DoS basique)
app.use(cookieParser());

// --- Routes ---
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

// --- Gestion d'erreurs générique (évite de fuiter la stack trace au client) ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Une erreur est survenue.' });
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB :', err);
    process.exit(1);
  });
