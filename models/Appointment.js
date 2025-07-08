const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prestador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dataHora: { type: Date, required: true },
  servico: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
