// Importações essenciais do React e bibliotecas externas
import React, { useState, useEffect, useContext } from 'react'; // React e hooks
import axios from 'axios'; // Cliente HTTP para requisições
import AuthContext from '../../../hooks/AuthContext'; // Contexto de autenticação da aplicação
import styles from '../../private/discipline/Discipline.module.css'; // Estilos CSS modularizados

/**
 * Componente Discipline
 * Exibe e gerencia disciplinas, permitindo que:
 * - Gestores: visualizem, criem, editem e excluam disciplinas;
 * - Professores: apenas visualizem suas próprias disciplinas.
 */
export function Discipline() {
  // Estados principais
  const [disciplinas, setDisciplinas] = useState([]); // Lista de disciplinas carregadas
  const [professores, setProfessores] = useState([]); // Lista de professores (apenas se o usuário for GESTOR)

  // Objeto com os campos do formulário de criação/edição
  const [newDiscipline, setNewDiscipline] = useState({
    nome: '',
    curso: '',
    descricao: '',
    carga_horaria: '',
    professor: ''
  });

  const [editingDiscipline, setEditingDiscipline] = useState(null); // Disciplina sendo editada (null = modo criação)
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
      ? `${API_BASE_URL}/disciplinas/` // GESTOR vê todas
      : `${API_BASE_URL}/disciplinas/professores/${ni}/`; // PROFESSOR vê apenas as suas

    // Faz a requisição GET para carregar as disciplinas
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setDisciplinas(response.data); // Atualiza o estado com as disciplinas
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
        // console.log(response.data);
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar professores:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar professores.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [authTokens, isGestor]);

  /**
   * Manipula o envio do formulário de disciplina (criação ou edição)
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do form
    if (!isGestor) return; // Apenas gestores podem submeter

    // Validações simples dos campos
    if (!newDiscipline.nome || !newDiscipline.curso || !newDiscipline.carga_horaria || !newDiscipline.professor) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (isNaN(newDiscipline.carga_horaria) || newDiscipline.carga_horaria <= 0) {
      setError('Carga horária deve ser um número positivo.');
      return;
    }

    try {
      if (editingDiscipline) {
        // Atualiza uma disciplina existente (modo edição)
        const response = await axios.patch(
          `${API_BASE_URL}/disciplinas/${editingDiscipline.id}/`,
          newDiscipline,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );

        // Atualiza apenas a disciplina editada na lista
        setDisciplinas(disciplinas.map((d) => (d.id === editingDiscipline.id ? response.data : d)));
        setEditingDiscipline(null); // Sai do modo edição
      } else {
        // Cria uma nova disciplina
        const response = await axios.post(
          `${API_BASE_URL}/disciplinas/`,
          newDiscipline,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );

        // Adiciona a nova disciplina à lista
        setDisciplinas([...disciplinas, response.data]);
      }

      // Limpa o formulário
      setNewDiscipline({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: '' });
      setError(null);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.detail || 'Um professor não pode ser associado a mais de uma disciplina.');
    }
  };

  /**
   * Inicia o modo de edição para uma disciplina existente
   * Preenche o formulário com os dados da disciplina
   */
  const startEditing = (disciplina) => {
    setEditingDiscipline(disciplina);
    setNewDiscipline({
      nome: disciplina.nome,
      curso: disciplina.curso,
      descricao: disciplina.descricao || '',
      carga_horaria: disciplina.carga_horaria,
      professor: disciplina.professor.toString() // Transforma em string para ser usado no <select>
    });
  };

  /**
   * Exclui uma disciplina com confirmação
   */
  const handleDeleteDiscipline = async (id) => {
    if (!isGestor) return;

    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta disciplina?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/disciplinas/${id}/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });

      // Remove do estado
      setDisciplinas(disciplinas.filter((disciplina) => disciplina.id !== id));
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      setError(error.response?.data?.detail || 'Erro ao excluir disciplina.');
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
      <h1>{isGestor ? 'Gerenciar Disciplinas' : 'Minhas Disciplinas'}</h1>

      {/* Exibe mensagens de erro */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Formulário (apenas para gestores) */}
      {isGestor && (
        <form onSubmit={handleSubmit} className={styles.form_container}>
          <div className={styles.form_grid}>
          <label className={styles.input_label}>Nome da Disciplina*</label>
          <input
            className={styles.input_field}
            type="text"
            placeholder="Nome da Disciplina"
            value={newDiscipline.nome}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, nome: e.target.value })}
            aria-label="Nome da disciplina"
          />
          <label className={styles.input_label}>Curso*</label>
          <input
            className={styles.input_field}
            type="text"
            placeholder="Curso"
            value={newDiscipline.curso}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, curso: e.target.value })}
            aria-label="Curso"
          />
          <label className={styles.input_label}>Carga Horária*</label>
          <input
            className={styles.input_field}
            type="number"
            placeholder="Carga Horária"
            value={newDiscipline.carga_horaria}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, carga_horaria: e.target.value })}
            aria-label="Carga horária"
          />
          <label className={styles.input_label}>Professor*</label>
          <select
            className={styles.input_field}
            value={newDiscipline.professor}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, professor: e.target.value })}
            aria-label="Professor"
          >
          <option value="">Selecione um professor*</option>
          {professores.map((professor) => (
          <option key={professor.id} value={professor.id}>
          {professor.username}
          </option>
          ))}
          </select>
          <label className={styles.input_label}>Descrição</label>
          <textarea
            className={styles.input_field}
            placeholder="Descrição"
            value={newDiscipline.descricao}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, descricao: e.target.value })}
            aria-label="Descrição"
          />
          </div>
        <div className={styles.btn_container}>
          
          <button type="submit" className={styles.submit_btn}>
          {editingDiscipline ? 'Salvar Alterações' : 'Adicionar Disciplina'}
          </button>
          {editingDiscipline && (
          <button
            type="button"
            className={styles.cancel_btn}
            onClick={() => {
            setEditingDiscipline(null);
            setNewDiscipline({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: '' });
          }}
          >
          Cancelar
          </button>
          )}
        </div>
        </form>
      )}

      {/* Lista de disciplinas */}
      <div className={styles.userCard}>
        {disciplinas.map((disciplina) => (
          <div key={disciplina.id} className={styles.card}>
            <h3>{disciplina.nome}</h3>
            <p><strong>Curso:</strong> {disciplina.curso}</p>
            <p><strong>Carga Horária:</strong> {disciplina.carga_horaria}</p>
            <p><strong>Descrição:</strong> {disciplina.descricao}</p>
            {isGestor && (
              <p><strong>Professor:</strong> {getProfessorName(disciplina.professor)}</p>
            )}
            {isGestor && (
              <div className={styles.btn_container}>
                <button onClick={() => startEditing(disciplina)} className={styles.action_btn}>Editar</button>
                <button onClick={() => handleDeleteDiscipline(disciplina.id)} className={styles.action_btn}>Excluir</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Exporta o componente como padrão
export default Discipline;
