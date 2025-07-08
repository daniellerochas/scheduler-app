const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  tipo: { type: String, enum: ['cliente', 'prestador'] }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
