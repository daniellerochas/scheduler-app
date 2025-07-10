const Appointment = require('../models/Appointment');
const User = require('../models/User');
const transporter = require('../config/emailConfig');
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

    const mailOptionsCliente = {
      from: process.env.EMAIL_USER,
      to: cliente.email,
      subject: 'Confirmação de Agendamento',
      text: `Olá ${cliente.nome}, seu agendamento para ${servico} com ${prestadorUser.nome} foi confirmado para ${date.toLocaleString()}.`
    };

    const mailOptionsPrestador = {
      from: process.env.EMAIL_USER,
      to: prestadorUser.email,
      subject: 'Novo Agendamento Confirmado',
      text: `Olá ${prestadorUser.nome}, você tem um novo agendamento para ${servico} com o cliente ${cliente.nome} em ${date.toLocaleString()}.`
    };

   // await Promise.all([
//   transporter.sendMail(mailOptionsCliente),
//   transporter.sendMail(mailOptionsPrestador)
// ]);

    res.status(201).json({ message: 'Agendamento criado com sucesso e e-mails enviados', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

// Listar agendamentos
async function listAppointments(req, res) {
  const userId = req.user.id;
  const userTipo = req.user.tipo;

  try {
    let filter = {};
    if (userTipo === 'cliente') filter = { cliente: userId };
    else if (userTipo === 'prestador') filter = { prestador: userId };
    else return res.status(403).json({ message: 'Tipo de usuário inválido' });

    const appointments = await Appointment.find(filter)
      .populate('cliente', 'nome email')
      .populate('prestador', 'nome email')
      .sort({ dataHora: 1 });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

// Atualizar agendamento
async function updateAppointment(req, res) {
  const { id } = req.params;
  const { dataHora, servico } = req.body;
  const userId = req.user.id;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });

    if (appointment.cliente.toString() !== userId && appointment.prestador.toString() !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    if (dataHora) {
      const newDate = new Date(dataHora);
      if (isNaN(newDate)) return res.status(400).json({ message: 'Data/hora inválida' });

      const conflito = await Appointment.findOne({
        prestador: appointment.prestador,
        dataHora: newDate,
        _id: { $ne: id }
      });
      if (conflito) return res.status(400).json({ message: 'Horário já ocupado' });

      appointment.dataHora = newDate;
    }

    if (servico) appointment.servico = servico;

    await appointment.save();
    res.json({ message: 'Agendamento atualizado com sucesso', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

// Deletar agendamento
async function deleteAppointment(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });

    if (appointment.cliente.toString() !== userId && appointment.prestador.toString() !== userId) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await appointment.remove();
    res.json({ message: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

module.exports = {
  createAppointment,
  listAppointments,
  updateAppointment,
  deleteAppointment
};
