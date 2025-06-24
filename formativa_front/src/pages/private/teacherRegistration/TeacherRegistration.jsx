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
    first_name: '', // Campo primeiro nome do usuário
    last_name: '', // Campo primeiro último nome do usuário
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
    if (!newUser.password || !newUser.username || !newUser.ni || !newUser.tipo || !newUser.email) {
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
        first_name: '',
        last_name: '',
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
      first_name: user.first_name || '',
      last_name: user.last_name || '',
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

    {error && <div className={styles.error}>{error}</div>}
    <form onSubmit={handleSubmit} className={styles.form_container}>
      <div className={styles.form_grid}>
        <div>
          <label className={styles.input_label}>Nome de Usuário*</label>
          <input className={styles.input_field} 
          type="text" 
          value={newUser.username} 
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} 
          required 
          placeholder='Nome de Usuário'
          />
        </div>
        <div>
          <label className={styles.input_label}>Senha*</label>
          <input className={styles.input_field} 
          type="password"
          value={newUser.password} 
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
          required 
          placeholder='Senha'
          />
        </div>
        <div>
          <label className={styles.input_label}>Primeiro Nome*</label>
          <input className={styles.input_field} 
          type="text" 
          value={newUser.first_name} 
          onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} 
          required 
          placeholder='Primeiro Nome'
          />
        </div>
        <div>
          <label className={styles.input_label}>Último Nome*</label>
          <input className={styles.input_field} 
          type="text" 
          value={newUser.last_name} 
          onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} 
          required 
          placeholder='Último Nome'
          />
        </div>
        <div>
          <label className={styles.input_label}>Tipo de Usuário*</label>
          <select className={styles.input_field} 
          value={newUser.tipo} 
          onChange={(e) => setNewUser({ ...newUser, tipo: e.target.value })} 
          required
          >
            <option value="PROFESSOR">Professor</option>
            <option value="GESTOR">Gestor</option>
          </select>
        </div>
        <div>
          <label className={styles.input_label}>Número de Identificação (NI)*</label>
          <input className={styles.input_field} 
          type="number" 
          value={newUser.ni} 
          onChange={(e) => setNewUser({ ...newUser, ni: e.target.value })} 
          required 
          placeholder='Número de Identificação (NI)'
          />
        </div>
        <div>
          <label className={styles.input_label}>E-mail*</label>
          <input className={styles.input_field} 
          type="email" 
          value={newUser.email} 
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          placeholder='E-mail Profissional'
          />
        </div>
        <div>
          <label className={styles.input_label}>Telefone</label>
          <input className={styles.input_field} 
          type="tel" 
          value={newUser.telefone} 
          onChange={(e) => setNewUser({ ...newUser, telefone: e.target.value })} 
          placeholder="Ex.: +5511999999999" />
        </div>
        <div>
          <label className={styles.input_label}>Data de Nascimento*</label>
          <input className={styles.input_field} 
          type="date" 
          value={newUser.data_nascimento} 
          onChange={(e) => setNewUser({ ...newUser, data_nascimento: e.target.value })} 
          />
        </div>

        <div>
          <label className={styles.input_label}>Data de Contratação*</label>
          <input className={styles.input_field} 
          type="date" 
          value={newUser.data_contratacao} 
          onChange={(e) => setNewUser({ ...newUser, data_contratacao: e.target.value })} 
          />
        </div>
      </div>

  <div className={styles.btn_container}>
    <button type="submit" className={styles.submit_btn}>{editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'}</button>
    {editingUser && (
    <button type="button" className={styles.cancel_btn} onClick={() => {
      setEditingUser(null);
      setNewUser({
        username: '', 
        password: '', 
        first_name: '', 
        last_name: '', 
        tipo: 'PROFESSOR',
        ni: '', 
        email: '', 
        telefone: '', 
        data_nascimento: '', 
        data_contratacao: ''
      });
      }}>Cancelar</button>
      )}
    </div>
  </form>

  <div className={styles.userCard}>
  {users.map((user) => (
    <div key={user.id} className={styles.card}>
      <h3>Usuário #{user.ni}</h3>
      <p><strong>Nome:</strong> {user.username}</p>
      <p><strong>Tipo:</strong> {user.tipo}</p>
    <div className={styles.btn_container}>
      <button onClick={() => startEditing(user)} className={styles.action_btn}>Editar</button>
      <button onClick={() => handleDeleteReservation(user.id)} className={styles.action_btn}>Excluir</button>
    </div>
    </div>
    ))}
    </div>
  </div>
  );
}

export default TeacherRegistration;