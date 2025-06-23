// Importações essenciais do React e bibliotecas externas
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../hooks/AuthContext';
import styles from '../../private/teacherRegistration/TeacherRegistration.module.css';

/**
 * @component TeacherRegistration
 * @description Componente exclusivo para gestores gerenciarem o cadastro de usuários (Professores ou Gestores).
 * - Permite criar, editar e excluir usuários com campos obrigatórios (senha, nome de usuário, tipo e NI).
 * @author [Seu Nome]
 * @version 1.0
 * @date 2025-06-23
 */
export function TeacherRegistration() {
  const [users, setUsers] = useState([]);
  // Estado para o formulário de criação/edição de usuário
  const [newUser, setNewUser] = useState({
    password: '', // Campo obrigatório para senha
    username: '', // Campo obrigatório para nome de usuário
    tipo: 'PROFESSOR', // Valor padrão conforme o modelo
    ni: '', // Campo obrigatório para número de identificação
    email: '',
    telefone: '',
    data_nascimento: '',
    data_contratacao: '',
  });

  const [editingUser, setEditingUser] = useState(null); // Usuário sendo editado (null para modo criação)
  const [error, setError] = useState(null); // Armazena mensagens de erro para exibição

  // Contexto de autenticação para acessar usuário e tokens
  const { user, authTokens } = useContext(AuthContext);
  const isGestor = user?.tipo === 'GESTOR';
  const API_BASE_URL = 'http://127.0.0.1:8000/app';

  // Listar todos os usuários cadastrados
  useEffect(() => {
    if (!isGestor) return;

    const source = axios.CancelToken.source();
    axios
      .get(`${API_BASE_URL}/usuarios/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
        cancelToken: source.token,
      })
      .then((response) => setUsers(response.data))
      .catch((error) => {
        if (axios.isCancel(error)) return; // Ignora erros de cancelamento silenciosamente
        console.error('Erro ao buscar usuários:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar usuários.');
      });
    return () => source.cancel();
  }, [authTokens, isGestor]);

  /**
   * @function handleSubmit
   * @description Manipula o envio do formulário para criar ou editar um usuário.
   * @param {Event} e - Evento de submissão do formulário.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGestor) return;

    // Validações simples dos campos
    if (!newUser.password || !newUser.username || !newUser.ni || !newUser.tipo) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (newUser.telefone && !/^\+?1?\d{9,15}$/.test(newUser.telefone)) {
      setError('Formato de telefone inválido. Use +5511999999999.');
      return;
    }

    try {
      if (editingUser) {
        const response = await axios.patch(
          `${API_BASE_URL}/usuarios/${editingUser.id}/`,
          newUser,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );
        setUsers(users.map((u) => (u.id === editingUser.id ? response.data : u)));
        setEditingUser(null);
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/usuarios/`,
          newUser,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );
        setUsers([...users, response.data]);
      }

      setNewUser({
        password: '',
        username: '',
        tipo: 'PROFESSOR',
        ni: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        data_contratacao: '',
      });
      setError(null);
      alert('Usuário salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setError(error.response?.data?.detail || 'Erro! Não foi possível salvar o usuário.');
    }
  };

  /**
   * @function startEditing
   * @description Inicia o modo de edição, preenchendo o formulário com os dados do usuário selecionado.
   * @param {Object} user - Objeto do usuário a ser editado.
   */
  const startEditing = (user) => {
    setEditingUser(user);
    setNewUser({
      password: user.password || '',
      username: user.username || '',
      tipo: user.tipo || 'PROFESSOR',
      ni: user.ni || '',
      email: user.email || '',
      telefone: user.telefone || '',
      data_nascimento: user.data_nascimento || '',
      data_contratacao: user.data_contratacao || '',
    });
  };

  /**
   * @function handleDeleteReservation
   * @description Exclui um usuário após confirmação.
   * @param {number} id - ID do usuário a ser excluído.
   */
  const handleDeleteReservation = async (id) => {
    if (!isGestor) return;

    const confirmDelete = window.confirm('Tem certeza que deseja excluir este usuário?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/usuarios/${id}/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      setUsers(users.filter((user) => user.id !== id));
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError(error.response?.data?.detail || 'Erro ao excluir usuário.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Gerenciar Usuários</h1>

      {/* Exibe mensagens de erro */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Formulário para criação/edição de usuários */}
      <form onSubmit={handleSubmit} className={`${styles.form} ${editingUser ? styles.editing : ''}`}>
        <label>Senha</label>
        <input
          className={styles.input}
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          aria-label="Senha"
          placeholder="Senha*"
          required
        />

        <label>Nome de Usuário</label>
        <input
          className={styles.input}
          type="text"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          aria-label="Nome de Usuário"
          placeholder="Nome de usuário*"
          required
        />

        <label>Tipo de Usuário</label>
        <select
          className={styles.input}
          value={newUser.tipo}
          onChange={(e) => setNewUser({ ...newUser, tipo: e.target.value })}
          aria-label="Tipo de Usuário"
          required
        >
          <option value="PROFESSOR">Professor</option>
          <option value="GESTOR">Gestor</option>
        </select>

        <label>Número de Identificação (NI)</label>
        <input
          className={styles.input}
          type="number"
          value={newUser.ni}
          onChange={(e) => setNewUser({ ...newUser, ni: e.target.value })}
          aria-label="Número de Identificação"
          placeholder="NI único*"
          required
        />

        <label>E-mail</label>
        <input
          className={styles.input}
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          aria-label="E-mail"
          placeholder="Opcional"
        />

        <label>Telefone</label>
        <input
          className={styles.input}
          type="tel"
          value={newUser.telefone}
          onChange={(e) => setNewUser({ ...newUser, telefone: e.target.value })}
          aria-label="Telefone"
          placeholder="Ex.: +5511999999999 (Opcional)"
        />

        <label>Data de Nascimento</label>
        <input
          className={styles.input}
          type="date"
          value={newUser.data_nascimento}
          onChange={(e) => setNewUser({ ...newUser, data_nascimento: e.target.value })}
          aria-label="Data de Nascimento"
        />

        <label>Data de Contratação</label>
        <input
          className={styles.input}
          type="date"
          value={newUser.data_contratacao}
          onChange={(e) => setNewUser({ ...newUser, data_contratacao: e.target.value })}
          aria-label="Data de Contratação"
        />

        <button type="submit" className={styles.button}>
          {editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
        </button>
        {editingUser && (
          <button
            type="button"
            className={`${styles.button} ${styles.cancel}`} // Adicionado estilo cancel
            onClick={() => {
              setEditingUser(null);
              setNewUser({
                password: '',
                username: '',
                tipo: 'PROFESSOR',
                ni: '',
                email: '',
                telefone: '',
                data_nascimento: '',
                data_contratacao: '',
              });
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de usuários cadastrados */}
      <div>
        {users.map((user) => (
          <div key={user.id} className={styles.reservationCard}>
            <h3>Usuário #{user.ni}</h3>
            <p><strong>Nome:</strong> {user.username}</p>
            <p><strong>Tipo:</strong> {user.tipo}</p>
            {isGestor && (
              <div className={styles.actionButtons}>
                <button onClick={() => startEditing(user)}>Editar</button>
                <button onClick={() => handleDeleteReservation(user.id)}>Excluir</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherRegistration;