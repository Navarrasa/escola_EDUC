// Importações essenciais do React e bibliotecas externas
import React, { useState, useEffect, useContext } from 'react'; // React e hooks
import axios from 'axios'; // Cliente HTTP para requisições
import AuthContext from '../../../hooks/AuthContext'; // Contexto de autenticação da aplicação
import styles from '../../private/Classroom/Classroom.module.css'; // Estilos CSS modularizados

/**
 * Componente Classroom
 * Exibe e gerencia Salas de Aula, permitindo que:
 * - Gestores: visualizem, criem, editem e excluam Salas de Aula;
 * - Professores: apenas visualizem suas próprias Salas de Aula.
 */
export function Classroom() {
  // Estados principais
  const [classrooms, setClassrooms] = useState([]); // Lista de Salas de Aula carregadas
  const [professores, setProfessores] = useState([]); // Lista de professores (apenas se o usuário for GESTOR)
  const [periodo, setPeriodos] = useState([]);
  // Objeto com os campos do formulário de criação/edição
  const [newClassroom, setNewClassroom] = useState({
    nome: '',
    curso: '',
    qtde_pessoas: '',
    periodo: '',
    professor: '',
    descricao: '',
  });

  const [editingClassroom, setEditingClassroom] = useState(null); // Classroom sendo editada (null = modo criação)
  const [error, setError] = useState(null); // Armazena mensagens de erro

  // Dados do usuário e tokens obtidos via contexto de autenticação
  const { user, authTokens } = useContext(AuthContext);

  // Verifica se o usuário logado é um gestor
  const isGestor = user?.tipo === 'GESTOR';

  // URL base da API
  const API_BASE_URL = 'http://127.0.0.1:8000/app';

  // Hook para carregar as disciplinas ao montar o componente ou quando `user`, `authTokens`, ou `isGestor` mudarem
  useEffect(() => {
    if (!user || !authTokens?.access) return; // Só executa se o usuário estiver autenticado

    const source = axios.CancelToken.source(); // Permite cancelar a requisição se necessário
    const token = authTokens.access;
    const ni = user.ni; // Número de identificação do usuário (provavelmente o ID ou matrícula)

    // Define a URL com base no tipo de usuário
    const url = isGestor
      ? `${API_BASE_URL}/salas/` // GESTOR vê todas as salas
      : `${API_BASE_URL}/salas/professores/${ni}/`; // PROFESSOR vê apenas as suas salas

    // Faz a requisição GET para carregar as disciplinas
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setClassrooms(response.data); // Atualiza o estado com as disciplinas
        setError(null); // Limpa qualquer erro anterior
      })
      .catch((error) => {
        if (axios.isCancel(error)) return; // Ignora se a requisição foi cancelada
        console.error('Erro ao buscar disciplinas:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar disciplinas.');
      });

    return () => source.cancel('Requisição cancelada'); // Limpa requisição ao desmontar
  }, [user, authTokens, isGestor]);

  // Hook para carregar professores se o usuário for um GESTOR
  useEffect(() => {
    if (!isGestor || !authTokens?.access) return;
    const source = axios.CancelToken.source();
    axios
      .get(`${API_BASE_URL}/usuarios/professores/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setProfessores(response.data); // Salva a lista de professores no estado
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar professores:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar professores.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [authTokens, isGestor]);
  // Hook para carregar os períodos das aulas disponíveis
  useEffect(() => {
    if (!isGestor || !authTokens?.access) return;
    const periodos = axios.CancelToken.source();
    axios
      .get(`${API_BASE_URL}/periodos/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
        cancelToken: periodos.token,
      })
      .then((response) => {
        setPeriodos(response.data); // Salva a lista de professores no estado
        // console.log(response.data)
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar os períodos:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar períodos.');
      });

    return () => periodos.cancel('Requisição cancelada');
  }, [authTokens, isGestor]);
  /**
   * Manipula o envio do formulário de disciplina (criação ou edição)
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do form
    if (!isGestor) return; // Apenas gestores podem submeter

    // Validações simples dos campos
    if (!newClassroom.nome || !newClassroom.curso || !newClassroom.qtde_pessoas || !newClassroom.professor || !newClassroom.periodo) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (isNaN(newClassroom.qtde_pessoas) || newClassroom.qtde_pessoas <= 0) {
      setError('A quantidade de alunos deve ser um número positivo.');
      return;
    }

    try {
      if (editingClassroom) {
        // Atualiza uma disciplina existente (modo edição)
        const response = await axios.patch(
          `${API_BASE_URL}/salas/${editingClassroom.id}/`,
          newClassroom,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );

        // Atualiza apenas a disciplina editada na lista -> c = classroom
        setClassrooms(classrooms.map((c) => (c.id === editingClassroom.id ? response.data : c)));
        setEditingClassroom(null); // Sai do modo edição
      } else {
        // Cria uma nova disciplina
        const response = await axios.post(
          `${API_BASE_URL}/salas/`,
          newClassroom,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );

        // Adiciona a nova disciplina à lista
        setClassrooms([...classrooms, response.data]);
      }

      // Limpa o formulário
      setNewClassroom({ nome: '', curso: '', descricao: '', qtde_pessoas: '', periodo: '', professor: '' });
      setError(null);
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro ao salvar Sala de Aula.');
    }
  };

  /**
   * Inicia o modo de edição para uma disciplina existente
   * Preenche o formulário com os dados da disciplina
   */
  const startEditing = (classrooms) => {
    setEditingClassroom(classrooms);
    setNewClassroom({
      nome: classrooms.nome,
      curso: classrooms.curso,
      descricao: classrooms.descricao || '',
      carga_horaria: classrooms.carga_horaria,
      periodo: classrooms.periodo.toString(), // Transforma em string para ser usado no <select>
      professor: classrooms.professor.toString() // Transforma em string para ser usado no <select>
    });
  };

  /**
   * Exclui uma disciplina com confirmação
   */
  const handleDeleteClassroom = async (id) => {
    if (!isGestor) return;

    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta Sala de Aula?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/salas/${id}/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });

      // Remove do estado
      setClassrooms(classrooms.filter((classrooms) => classrooms.id !== id));
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir Sala de Aula:', error);
      setError(error.response?.data?.detail || 'Erro ao excluir Sala de Aula.');
    }
  };

  /**
   * Retorna o nome do professor com base no ID
   */
  const getProfessorName = (professorId) => {
    const professor = professores.find((p) => p.id === Number(professorId));
    return professor ? professor.username : 'Desconhecido';
  };

  return (
    <div className={styles.container}>
      <h1>{isGestor ? 'Gerenciar Salas de Aula' : 'Minhas Salas de Aula'}</h1>

      {/* Exibe mensagens de erro */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Formulário (apenas para gestores) */}
      {isGestor && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nome da Sala*"
            value={newClassroom.nome}
            onChange={(e) => setNewClassroom({ ...newClassroom, nome: e.target.value })}
            aria-label="Nome da Sala"
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Curso*"
            value={newClassroom.curso}
            onChange={(e) => setNewClassroom({ ...newClassroom, curso: e.target.value })}
            aria-label="Curso"
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Quantidade de Alunos*"
            value={newClassroom.carga_horaria}
            onChange={(e) => setNewClassroom({ ...newClassroom, carga_horaria: e.target.value })}
            aria-label="Quantidade de Alunos"
          />
          <select
            className={styles.input}
            value={newClassroom.periodo}
            onChange={(e) => setNewClassroom({ ...newClassroom, periodo: e.target.value })}
            aria-label="Período"
          >
            <option value="">Período da Aula*</option>
            {periodo.map((periodo) => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.label}
              </option>
            ))}
          </select>
          <select
            className={styles.input}
            value={newClassroom.professor}
            onChange={(e) => setNewClassroom({ ...newClassroom, professor: e.target.value })}
            aria-label="Professor"
          >
            <option value="">Selecione um professor*</option>
            {professores.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.username}
              </option>
            ))}
          </select>
          <textarea
            className={styles.input}
            placeholder="Descrição da Aula"
            value={newClassroom.descricao}
            onChange={(e) => setNewClassroom({ ...newClassroom, descricao: e.target.value })}
            aria-label="Descrição da Aula"
          />
          <button type="submit" className={styles.button}>
            {editingClassroom ? 'Salvar Alterações' : 'Adicionar Sala de Aula'}
          </button>
          {editingClassroom && (
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setEditingClassroom(null);
                setNewClassroom({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: '' });
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      )}

      {/* Lista de disciplinas */}
      <div>
        {classrooms.map((classrooms) => (
          <div key={classrooms.id} className={styles.ClassroomCard}>
            <h3>{classrooms.nome}</h3>
            <p><strong>Curso:</strong> {classrooms.curso}</p>
            <p><strong>Carga Horária:</strong> {classrooms.carga_horaria}</p>
            <p><strong>Descrição:</strong> {classrooms.descricao}</p>
            {isGestor && (
              <p><strong>Professor:</strong> {getProfessorName(classrooms.professor)}</p>
            )}
            {isGestor && (
              <div className={styles.actionButtons}>
                <button onClick={() => startEditing(classrooms)}>Editar</button>
                <button onClick={() => handleDeleteClassroom(classrooms.id)}>Excluir</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Exporta o componente como padrão
export default Classroom;
