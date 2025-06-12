import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../hooks/AuthContext';
import styles from '../../private/discipline/Discipline.module.css';

/**
 * Componente Discipline
 * Exibe e gerencia disciplinas, permitindo que Gestores criem/editarem/excluam disciplinas
 * e Professores visualizem apenas suas próprias disciplinas.
 */
export function Discipline() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [newDiscipline, setNewDiscipline] = useState({
    nome: '',
    curso: '',
    descricao: '',
    carga_horaria: '',
    professor: ''
  });
  const [editingDiscipline, setEditingDiscipline] = useState(null); // Novo estado para edição
  const [error, setError] = useState(null);
  const { user, authTokens } = useContext(AuthContext);
  const isGestor = user?.tipo === 'GESTOR';
  const API_BASE_URL = 'http://127.0.0.1:8000/app';

  // Carrega disciplinas
  useEffect(() => {
    if (!user || !authTokens?.access) return;

    const source = axios.CancelToken.source();
    const token = authTokens.access;
    const ni = user.ni;
    const url = isGestor
      ? `${API_BASE_URL}/disciplinas/`
      : `${API_BASE_URL}/disciplinas/professores/${ni}/`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setDisciplinas(response.data);
        setError(null);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar disciplinas:', error);
        setError(error.response?.data?.detail || 'Erro ao carregar disciplinas.');
      });

    return () => source.cancel('Requisição cancelada');
  }, [user, authTokens, isGestor]);

  // Carrega professores (apenas para Gestores)
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

  // Função para submissão do formulário (adicionar ou editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGestor) return;

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
        // Modo edição: PATCH
        const response = await axios.patch(
          `${API_BASE_URL}/disciplinas/${editingDiscipline.id}/`,
          newDiscipline,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );
        setDisciplinas(disciplinas.map((d) => (d.id === editingDiscipline.id ? response.data : d)));
        setEditingDiscipline(null); // Sai do modo edição
      } else {
        // Modo adição: POST
        const response = await axios.post(
          `${API_BASE_URL}/disciplinas/`,
          newDiscipline,
          { headers: { Authorization: `Bearer ${authTokens.access}` } }
        );
        setDisciplinas([...disciplinas, response.data]);
      }
      setNewDiscipline({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: '' }); // Reseta formulário
      setError(null);
    } catch (error) {
      // console.error('Erro ao salvar disciplina:', error);
      setError(error.response?.data?.detail || 'Erro ao salvar disciplina.');
    }
  };

  // Função para iniciar a edição
  const startEditing = (disciplina) => {
    setEditingDiscipline(disciplina); // Define a disciplina sendo editada
    setNewDiscipline({
      nome: disciplina.nome,
      curso: disciplina.curso,
      descricao: disciplina.descricao || '',
      carga_horaria: disciplina.carga_horaria,
      professor: disciplina.professor.toString() // Converte para string para o select
    });
  };

  const handleDeleteDiscipline = async (id) => {
    if (!isGestor) return;

    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta disciplina?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/disciplinas/${id}/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      setDisciplinas(disciplinas.filter((disciplina) => disciplina.id !== id));
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      setError(error.response?.data?.detail || 'Erro ao excluir disciplina.');
    }
  };

  // Função para obter o nome do professor pelo ID
  const getProfessorName = (professorId) => {
    const professor = professores.find((p) => p.id === Number(professorId));
    return professor ? professor.username : 'Desconhecido';
  };

  return (
    <div className={styles.container}>
      <h1>{isGestor ? 'Gerenciar Disciplinas' : 'Minhas Disciplinas'}</h1>

      {error && <div className={styles.error}>{error}</div>}

      {isGestor && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nome da Disciplina"
            value={newDiscipline.nome}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, nome: e.target.value })}
            aria-label="Nome da disciplina"
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Curso"
            value={newDiscipline.curso}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, curso: e.target.value })}
            aria-label="Curso"
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Carga Horária"
            value={newDiscipline.carga_horaria}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, carga_horaria: e.target.value })}
            aria-label="Carga horária"
          />
          <select
            className={styles.input}
            value={newDiscipline.professor}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, professor: e.target.value })}
            aria-label="Professor"
          >
            <option value="">Selecione um professor</option>
            {professores.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.username}
              </option>
            ))}
          </select>
          <textarea
            className={styles.input}
            placeholder="Descrição"
            value={newDiscipline.descricao}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, descricao: e.target.value })}
            aria-label="Descrição"
          />
          <button type="submit" className={styles.button}>
            {editingDiscipline ? 'Salvar Alterações' : 'Adicionar Disciplina'}
          </button>
          {editingDiscipline && (
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setEditingDiscipline(null);
                setNewDiscipline({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: '' });
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      )}

      <div>
        {disciplinas.map((disciplina) => (
          <div key={disciplina.id} className={styles.disciplineCard}>
            <h3>{disciplina.nome}</h3>
            <p><strong>Curso:</strong> {disciplina.curso}</p>
            <p><strong>Carga Horária:</strong> {disciplina.carga_horaria}</p>
            <p><strong>Descrição:</strong> {disciplina.descricao}</p>
            {isGestor && (
              <p><strong>Professor:</strong> {getProfessorName(disciplina.professor)}</p>
            )}
            {isGestor && (
              <div className={styles.actionButtons}>
                <button onClick={() => startEditing(disciplina)}>Editar</button>
                <button onClick={() => handleDeleteDiscipline(disciplina.id)}>Excluir</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Discipline;