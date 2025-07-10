const Appointment = require('../models/Appointment');
const User = require('../models/User');
const resend = require('../config/resend');
const mongoose = require('mongoose');

// Criar agendamento (valida conflito)
async function createAppointment(req, res) {
  const { prestador, dataHora, servico } = req.body;
  const clienteId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(prestador)) {
      return res.status(400).json({ message: 'ID do prestador inválido' });
    }

    const date = new Date(dataHora);
    if (isNaN(date)) return res.status(400).json({ message: 'Data/hora inválida' });

    const conflito = await Appointment.findOne({ prestador, dataHora: date });
    if (conflito) return res.status(400).json({ message: 'Horário já ocupado' });

    const appointment = new Appointment({
      cliente: clienteId,
      prestador,
      dataHora: date,
      servico
    });

    await appointment.save();

    // Buscar dados do cliente e prestador para o e-mail
    const cliente = await User.findById(clienteId);
    const prestadorUser = await User.findById(prestador);

    await Promise.all([
      resend.emails.send({
        from: 'Agendamentos <onboarding@resend.dev>',
        to: cliente.email,
        subject: 'Confirmação de Agendamento',
        text: `Olá ${cliente.nome}, seu agendamento para ${servico} com ${prestadorUser.nome} foi confirmado para ${date.toLocaleString()}.`
      }),
      resend.emails.send({
        from: 'Agendamentos <onboarding@resend.dev>',
        to: prestadorUser.email,
        subject: 'Novo Agendamento Confirmado',
        text: `Olá ${prestadorUser.nome}, você tem um novo agendamento para ${servico} com o cliente ${cliente.nome} em ${date.toLocaleString()}.`
      })
    ]);

    res.status(201).json({ message: 'Agendamento criado com sucesso e e-mails enviados', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}
