// Importações essenciais do React e bibliotecas externas
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../hooks/AuthContext';
import styles from '../../private/reservation/Reservation.module.css';

/**
 * @component Reservation
 * @description Componente que permite a gestão de reservas de salas por gestores e a visualização por professores.
 * - Gestores podem criar, editar e excluir reservas.
 * - Professores podem visualizar apenas suas próprias reservas.
 * @author [Seu Nome]
 * @version 1.0
 * @date 2025-06-23
 */
export function Reservation() {
  // Estados principais para gerenciar os dados do componente
  const [reservas, setReservas] = useState([]); // Lista de reservas carregadas da API
  const [professores, setProfessores] = useState([]); // Lista de professores (exclusiva para gestores)
  const [disciplinas, setDisciplinas] = useState([]); // Lista de disciplinas disponíveis
  const [periodos, setPeriodos] = useState([]); // Lista de períodos disponíveis
  const [salas, setSalas] = useState([]); // Lista de salas disponíveis

  // Estado para o formulário de criação/edição de reservas
  const [newReserva, setNewReserva] = useState({
    data_inicio: '',
    data_termino: '',
    periodo: '',
    sala_reservada: '',
    professor: '',
    disciplina: '',
  });

  const [editingReservation, setEditingReservation] = useState(null); // Reserva sendo editada (null para modo criação)
  const [error, setError] = useState(null); // Armazena mensagens de erro para exibição

  // Contexto de autenticação para acessar usuário e tokens
  const { user, authTokens } = useContext(AuthContext);
  const isGestor = user?.tipo === 'GESTOR';
  const API_BASE_URL = 'http://127.0.0.1:8000/app';

  /**
   * @function formatDate
   * @description Formata uma data no formato ISO (ex.: "2025-06-14T00:00:00Z") para "yyyy-MM-dd".
   * @param {string} dateString - Data no formato ISO 8601.
   * @returns {string} - Data formatada como "yyyy-MM-dd".
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Remove o horário e mantém apenas a data
  };

  // Hook para carregar as reservas
  useEffect(() => {
    if (!user || !authTokens?.access) return;

    const source = axios.CancelToken.source();
    const token = authTokens.access;
    const ni = user.ni;
    const url = isGestor
      ? `${API_BASE_URL}/reservas/`
      : `${API_BASE_URL}/reservas/professores/${ni}/`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: source.token,
      })
      .then((response) => {
        // Formata as datas antes de setar no estado
        const formattedReservas = response.data.map((reserva) => ({
          ...reserva,
          data_inicio: formatDate(reserva.data_inicio),
          data_termino: formatDate(reserva.data_termino),
        }));
        setReservas(formattedReservas);
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar reservas:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar reservas.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [user, authTokens, isGestor]);

  // Hook para carregar as salas disponíveis
  useEffect(() => {
    if (!isGestor || !authTokens?.access) return;
    const source = axios.CancelToken.source();
    axios
      .get(`${API_BASE_URL}/salas/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setSalas(Array.isArray(response.data) ? response.data : []);
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar salas:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar salas.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [authTokens, isGestor]);

  // Hook para carregar professores
  useEffect(() => {
    if (!isGestor || !authTokens?.access) return;
    const source = axios.CancelToken.source();
    axios
      .get(`${API_BASE_URL}/usuarios/professores/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setProfessores(response.data);
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar professores:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar professores.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [authTokens, isGestor]);

  // Hook para carregar os períodos
  useEffect(() => {
    if (!isGestor || !authTokens?.access) return;
    const source = axios.CancelToken.source();
    axios
      .get(`${API_BASE_URL}/periodos/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setPeriodos(Array.isArray(response.data) ? response.data : []);
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar períodos:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar períodos.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [authTokens, isGestor]);

  // Hook para carregar as disciplinas
  useEffect(() => {
    if (!isGestor || !authTokens?.access) return;
    const source = axios.CancelToken.source();
    axios
      .get(`${API_BASE_URL}/disciplinas/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setDisciplinas(Array.isArray(response.data) ? response.data : []);
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar disciplinas:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar disciplinas.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [authTokens, isGestor]);

  /**
   * @function handleSubmit
   * @description Manipula o envio do formulário para criar ou editar uma reserva.
   * @param {Event} e - Evento de submissão do formulário.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGestor) return;

    // Validações simples dos campos
    if (
      !newReserva.data_inicio ||
      !newReserva.data_termino ||
      !newReserva.periodo ||
      !newReserva.sala_reservada ||
      !newReserva.professor ||
      !newReserva.disciplina
    ) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (newReserva.data_inicio >= newReserva.data_termino) {
      setError('A data de início deve ser anterior à data de término.');
      return;
    }

    // Validação de conflitos (simples, no frontend)
    const hasConflict = reservas.some((reserva) => {
      if (editingReservation && reserva.id === editingReservation.id) return false;
      return (
        (reserva.sala_reservada === newReserva.sala_reservada &&
          reserva.data_inicio === newReserva.data_inicio &&
          reserva.periodo === newReserva.periodo &&
          reserva.professor !== newReserva.professor) ||
        (reserva.periodo === newReserva.periodo && reserva.data_inicio === newReserva.data_inicio)
      );
    });

    if (hasConflict) {
      setError('Conflito: sala já reservada por outro professor ou período em uso.');
      return;
    }

    try {
      if (editingReservation) {
        const response = await axios.patch(
          `${API_BASE_URL}/reservas/${editingReservation.id}/`,
          newReserva,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );
        setReservas(reservas.map((r) => (r.id === editingReservation.id ? response.data : r)));
        setEditingReservation(null);
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/reservas/`,
          newReserva,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );
        setReservas([...reservas, response.data]);
      }

      setNewReserva({
        data_inicio: '',
        data_termino: '',
        periodo: '',
        sala_reservada: '',
        professor: '',
        disciplina: '',
      });
      setError(null);
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      setError(error.response?.data?.detail || 'Erro! Não foi possível salvar a reserva.');
    }
  };

  /**
   * @function startEditing
   * @description Inicia o modo de edição, preenchendo o formulário com os dados da reserva selecionada.
   * @param {Object} reserva - Objeto da reserva a ser editada.
   */
  const startEditing = (reserva) => {
    setEditingReservation(reserva);
    setNewReserva({
      data_inicio: formatDate(reserva.data_inicio), // Formata a data para yyyy-MM-dd
      data_termino: formatDate(reserva.data_termino), // Formata a data para yyyy-MM-dd
      periodo: reserva.periodo.toString(),
      sala_reservada: reserva.sala_reservada.toString(),
      professor: reserva.professor.toString(),
      disciplina: reserva.disciplina.toString(),
    });
  };

  /**
   * @function handleDeleteReservation
   * @description Exclui uma reserva após confirmação do usuário.
   * @param {number} id - ID da reserva a ser excluída.
   */
  const handleDeleteReservation = async (id) => {
    if (!isGestor) return;

    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta reserva?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/reservas/${id}/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      setReservas(reservas.filter((reserva) => reserva.id !== id));
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      setError(error.response?.data?.detail || 'Erro ao excluir reserva.');
    }
  };

  /**
   * @function getProfessorName
   * @description Retorna o nome do professor com base no ID.
   * @param {number} professorId - ID do professor.
   * @returns {string} - Nome do professor ou "Desconhecido" se não encontrado.
   */
  const getProfessorName = (professorId) => {
    const professor = professores.find((p) => p.id === Number(professorId));
    return professor ? professor.username : 'Desconhecido';
  };

  const getSalaName = (salaId) => {
    const sala = salas.find((s) => s.id === Number(salaId));
    return sala ? sala.nome : 'Desconhecida';
  }

  const getDisciplinaName = (disciplinaId) => {
    const disciplina = disciplinas.find((d) => d.id === Number(disciplinaId));
    return disciplina ? disciplina.nome : 'Desconhecida';
  }

  return (
    <div className={styles.container}>
      <h1>{isGestor ? 'Gerenciar Reservas' : 'Minhas Reservas'}</h1>

      {/* Exibe mensagens de erro */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Formulário (apenas para gestores) */}
      {isGestor && (
        <form onSubmit={handleSubmit} className={styles.form_container}>

          <div className={styles.form_grid}>
            <div>
              <label className={styles.input_label}>Data Início</label>
              <input
                className={styles.input_field}
                type="date"
                value={newReserva.data_inicio}
                onChange={(e) => setNewReserva({ ...newReserva, data_inicio: e.target.value })}
                aria-label="Data Início da Reserva"
              />
            </div>
            <div>
              <label className={styles.input_label}>Data Término</label>
              <input
                className={styles.input_field}
                type="date"
                value={newReserva.data_termino}
                onChange={(e) => setNewReserva({ ...newReserva, data_termino: e.target.value })}
                aria-label="Data Término da Reserva"
              />
            </div>
            <div>
              <label className={styles.input_label}>Professor</label>
              <select
                className={styles.input_field}
                value={newReserva.professor}
                onChange={(e) => setNewReserva({ ...newReserva, professor: e.target.value })}
                aria-label="Professor"
              >
                <option value="">Selecione um professor*</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.input_label}>Disciplina</label>
              <select
                className={styles.input_field}
                value={newReserva.disciplina}
                onChange={(e) => setNewReserva({ ...newReserva, disciplina: e.target.value })}
                aria-label="Disciplina"
              >
                <option value="">Selecione uma disciplina*</option>
                {disciplinas.map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.input_label}>Sala Reservada</label>
              <select
                className={styles.input_field}
                value={newReserva.sala_reservada}
                onChange={(e) => setNewReserva({ ...newReserva, sala_reservada: e.target.value })}
                aria-label="Sala Reservada"
              >
                <option value="">Selecione uma Sala*</option>
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              
              <label className={styles.input_label}>Período da Reserva</label>
              <select
                className={styles.input_field}
                value={newReserva.periodo}
                onChange={(e) => setNewReserva({ ...newReserva, periodo: e.target.value })}
                aria-label="Período"
              >
                <option value="">Selecione um período*</option>
                {periodos.map((periodo) => (
                  <option key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.btn_container}>  
            <button type="submit" className={styles.submit_btn}>
              {editingReservation ? 'Salvar Alterações' : 'Adicionar Reserva'}
            </button>
            {editingReservation && (
              <button
                type="button"
                className={styles.cancel_btn}
                onClick={() => {
                  setEditingReservation(null);
                  setNewReserva({
                    data_inicio: '',
                    data_termino: '',
                    periodo: '',
                    sala_reservada: '',
                    professor: '',
                    disciplina: '',
                  });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
        )}

      {/* Lista de reservas */}
      <div className={styles.userCard}>
        {reservas.map((reserva) => (
          <div key={reserva.id} className={styles.card}>
            <h3>Reserva #{reserva.id}</h3>
            <p><strong>Data de Início:</strong> {reserva.data_inicio}</p>
            <p><strong>Data de Término:</strong> {reserva.data_termino}</p>
            <p><strong>Período:</strong> {reserva.periodo}</p>
            <p><strong>Sala:</strong> {getSalaName(reserva.sala_reservada)}</p>
            <p><strong>Disciplina:</strong> {getDisciplinaName(reserva.disciplina)}</p>
            {isGestor && <p><strong>Professor:</strong> {getProfessorName(reserva.professor)}</p>}
            {isGestor && (
              <div className={styles.btn_container}>
                <button onClick={() => startEditing(reserva)} className={styles.action_btn}>Editar</button>
                <button onClick={() => handleDeleteReservation(reserva.id)} className={styles.action_btn}>Excluir</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reservation;