const User = require('../models/User');
console.log('User model:', User);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Função para cadastro
async function register(req, res) {
  const { nome, email, senha, tipo } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email já cadastrado' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const newUser = new User({
      nome,
      email,
      senha: hashedPassword,
      tipo
    });

    try {
      await newUser.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        return res.status(400).json({ message: 'Email já cadastrado (confirmação no save)' });
      }
      throw saveError;
    }

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

// Função para login
async function login(req, res) {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email ou senha incorretos' });

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(400).json({ message: 'Email ou senha incorretos' });

    const token = jwt.sign(
      { id: user._id, tipo: user.tipo, nome: user.nome },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, nome: user.nome, email: user.email, tipo: user.tipo } });
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

// Função para listar usuários (exemplo: listar só prestadores)
async function listUsers(req, res) {
  try {
    const users = await User.find({ tipo: 'prestador' }).select('_id nome email tipo');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}

module.exports = { register, login, listUsers };
