import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../hooks/AuthContext';
import styles from '../../private/discipline/Discipline.module.css';

/**
 * Componente Discipline
 * Exibe e gerencia disciplinas, permitindo que Gestores criem/excluam disciplinas
 * e Professores visualizem apenas suas próprias disciplinas.
 */
export function Discipline() {
  // Estado para armazenar a lista de disciplinas
  const [disciplinas, setDisciplinas] = useState([]);
  // Estado para o formulário de nova disciplina
  const [newDiscipline, setNewDiscipline] = useState({
    nome: '',
    curso: '',
    descricao: '',
    carga_horaria: '',
    professor: ''
  });
  // Estado para erros no formulário ou requisições
  const [error, setError] = useState(null);
  // Contexto de autenticação
  const { user, authTokens } = useContext(AuthContext);
  // Verifica se o usuário é Gestor
  const isGestor = user?.tipo === 'GESTOR';

  /**
   * Carrega as disciplinas com base no tipo de usuário
   * Gestores veem todas as disciplinas; Professores veem apenas as suas
   */
  useEffect(() => {
    if (!user || !authTokens?.access) return;

    const source = axios.CancelToken.source();
    const token = authTokens.access;
    const ni = user.ni;
    // Corrigido: Renomeado 'urlunderstand_url' para 'url'
    const url = isGestor
      ? 'http://127.0.0.1:8000/app/disciplinas/'
      : `http://127.0.0.1:8000/app/disciplinas/professores/${ni}/`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: source.token,
      })
      .then((response) => {
        setDisciplinas(response.data);
        setError(null); // Limpa erros anteriores
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error('Erro ao buscar disciplinas:', error);
        setError('Erro ao carregar disciplinas. Tente novamente.');
      });

    // Cleanup: Cancela a requisição ao desmontar o componente
    return () => source.cancel('Requisição cancelada');
  }, [user, authTokens, isGestor]);

  /**
   * Adiciona uma nova disciplina (apenas Gestores)
   * @param {Event} e - Evento do formulário
   */
  const handleAddDiscipline = async (e) => {
    e.preventDefault();
    if (!isGestor) return;

    // Validação básica do formulário
    if (!newDiscipline.nome || !newDiscipline.curso || !newDiscipline.carga_horaria) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (isNaN(newDiscipline.carga_horaria) || newDiscipline.carga_horaria <= 0) {
      setError('Carga horária deve ser um número positivo.');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/app/disciplinas/',
        newDiscipline,
        { headers: { Authorization: `Bearer ${authTokens.access}` } }
      );
      setDisciplinas([...disciplinas, response.data]);
      setNewDiscipline({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: '' });
      setError(null);
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      setError('Erro ao adicionar disciplina. Tente novamente.');
    }
  };

  /**
   * Exclui uma disciplina
   * @param {number} id - ID da disciplina a ser excluída
   */
  const handleDeleteDiscipline = async (id) => {
    if (!isGestor) return;

    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta disciplina?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/app/disciplinas/${id}/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      setDisciplinas(disciplinas.filter((disciplina) => disciplina.id !== id));
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      setError('Erro ao excluir disciplina.');
    }
  };

  /**
   * Atualiza uma disciplina (apenas Gestores)
   * @param {number} id - ID da disciplina a ser atualizada
   * @param {Object} updatedData - Dados atualizados da disciplina
   */
  const handleUpdateDiscipline = async (id, updatedData) => {
    if (!isGestor) return;

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/app/disciplinas/${id}/`,
        updatedData,
        { headers: { Authorization: `Bearer ${authTokens.access}` } }
      );
      setDisciplinas(disciplinas.map((d) => (d.id === id ? response.data : d)));
      setError(null);
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      setError('Erro ao atualizar disciplina.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>{isGestor ? 'Gerenciar Disciplinas' : 'Minhas Disciplinas'}</h1>

      {/* Exibe mensagens de erro, se houver */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Formulário para adicionar disciplina (apenas Gestores) */}
      {isGestor && (
        <form onSubmit={handleAddDiscipline} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nome da Disciplina"
            value={newDiscipline.nome}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, nome: e.target.value })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Curso"
            value={newDiscipline.curso}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, curso: e.target.value })}
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Carga Horária"
            value={newDiscipline.carga_horaria}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, carga_horaria: e.target.value })}
          />
          <input
            className={styles.input}
            type="number"
            placeholder="ID do Professor"
            value={newDiscipline.professor}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, professor: e.target.value })}
          />
          <textarea
            className={styles.input}
            placeholder="Descrição"
            value={newDiscipline.descricao}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, descricao: e.target.value })}
          />
          <button type="submit" className={styles.button}>Adicionar Disciplina</button>
        </form>
      )}

      {/* Lista de disciplinas */}
      <div>
        {disciplinas.map((disciplina) => (
          <div key={disciplina.id} className={styles.disciplineCard}>
            <h3>{disciplina.nome}</h3>
            <p><strong>Curso:</strong> {disciplina.curso}</p>
            <p><strong>Carga Horária:</strong> {disciplina.carga_horaria}</p>
            <p><strong>Descrição:</strong> {disciplina.descricao}</p>
            {isGestor && (
              <p><strong>Professor:</strong> {disciplina.professor}</p>
            )}
            {isGestor && (
              <div className={styles.actionButtons}>
                <button onClick={() => handleUpdateDiscipline(disciplina.id, disciplina)}>
                  Editar
                </button>
                <button onClick={() => handleDeleteDiscipline(disciplina.id)}>
                  Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Discipline;