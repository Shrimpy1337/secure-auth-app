const mongoose = require('mongoose');

// Le mot de passe n'est JAMAIS stocké en clair : uniquement son hash (bcrypt, voir authController).
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    refreshTokenHash: {
      // On stocke un hash du refresh token, jamais le token en clair,
      // pour limiter les dégâts en cas de fuite de la base de données.
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
