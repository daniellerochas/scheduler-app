import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import FormInput from '../components/FormInput';

function Register() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.nome || !form.email || !form.senha || !form.confirmarSenha || !form.tipo) {
      setError('Preencha todos os campos');
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await api.post('/users/register', {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        tipo: form.tipo
      });
      setSuccess('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 2000); // Redireciona após 2 segundos
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar usuário');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrar-se</h2>
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nome"
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Seu nome completo"
          />
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="seu@email.com"
          />
          <FormInput
            label="Senha"
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            placeholder="Digite sua senha"
          />
          <FormInput
            label="Confirmar Senha"
            type="password"
            name="confirmarSenha"
            value={form.confirmarSenha}
            onChange={handleChange}
            placeholder="Confirme sua senha"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Tipo de usuário</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecione</option>
            <option value="cliente">Cliente</option>
            <option value="prestador">Prestador</option>
          </select>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          <button
            type="submit"
            className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
