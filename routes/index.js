const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const userRoutes = require('./userRoutes');
const appointmentRoutes = require('./appointmentRoutes');

// Rota de teste protegida
router.get('/protegida', auth, (req, res) => {
  res.json({ message: `Bem-vinda, ${req.user.nome}. Essa rota é protegida!` });
});

// Agrupar rotas
router.use('/users', userRoutes);               // /api/users/ (GET listar, POST register/login)
router.use('/appointments', appointmentRoutes); // /api/appointments/

module.exports = router;
