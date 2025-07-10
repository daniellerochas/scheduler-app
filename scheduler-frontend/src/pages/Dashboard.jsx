import { useEffect, useState } from 'react';
import api from '../services/api.js';

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    prestador: '',
    dataHora: '',
    servico: '',
  });

  // Puxar os agendamentos do backend
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar prestadores cadastrados
  const fetchPrestadores = async () => {
    try {
      const res = await api.get('/users/prestadores');
      setPrestadores(res.data);
    } catch (err) {
      console.error('Erro ao carregar prestadores:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPrestadores();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.prestador || !form.dataHora || !form.servico) {
      setError('Preencha todos os campos do formulário');
      return;
    }

    console.log('[ENVIANDO FORMULÁRIO]', form); // 🔍 DEBUG

    try {
      await api.post('/appointments', form);
      setForm({ prestador: '', dataHora: '', servico: '' });
      fetchAppointments(); // Atualizar lista
    } catch (error) {
      console.error('[ERRO NO POST]', error.response?.data); // 🔍 DEBUG
      setError(error.response?.data?.message || 'Erro ao criar agendamento');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao deletar agendamento');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Seus Agendamentos</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Carregando agendamentos...</p>
      ) : (
        <div className="mb-8">
          {appointments.length === 0 ? (
            <p>Nenhum agendamento encontrado.</p>
          ) : (
            <ul>
              {appointments.map((app) => (
                <li key={app._id} className="bg-white p-4 mb-2 rounded shadow flex justify-between items-center">
                  <div>
                    <p><strong>Serviço:</strong> {app.servico}</p>
                    <p><strong>Data/Hora:</strong> {new Date(app.dataHora).toLocaleString()}</p>
                    <p><strong>Prestador:</strong> {app.prestador?.nome || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(app._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Novo Agendamento</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md">
        <label className="block mb-2">
          Prestador:
          <select
            name="prestador"
            value={form.prestador}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione um prestador</option>
            {prestadores.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block mb-2">
          Data e Hora:
          <input
            type="datetime-local"
            name="dataHora"
            value={form.dataHora}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-4">
          Serviço:
          <input
            type="text"
            name="servico"
            value={form.servico}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Descrição do serviço"
          />
        </label>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Agendar
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
