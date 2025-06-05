import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../hooks/AuthContext';
import styles from '../../private/discipline/Discipline.module.css';

export function Discipline() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [newDiscipline, setNewDiscipline] = useState({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: ''});
  const { user, authTokens } = useContext(AuthContext);

  // Determina se o usuário é Diretor (exemplo: baseado em um campo 'tipo')
  const isGestor = user?.tipo === 'Gestor'

  // Carrega disciplinas com base no cargo
  useEffect(() => {
    if (!user || !authTokens?.access) return;

    const token = authTokens.access;
    const ni = user.ni;
    const url = isGestor
      ? 'http://127.0.0.1:8000/app/disciplinas/' // Endpoint para Diretores (todas as disciplinas)
      : `http://127.0.0.1:8000/app/disciplinas/professores/${ni}/`; // Endpoint para Professores

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setDisciplinas(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar disciplinas:', error);
      });
  }, [user, authTokens, isGestor]);

  // Função para adicionar disciplina (apenas Diretores)
  const handleAddDiscipline = async (e) => {
    e.preventDefault();
    if (!isGestor) return; // Segurança no frontend

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/app/disciplinas/',
        newDiscipline,
        {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        }
      );
      setDisciplinas([...disciplinas, response.data]);
      setNewDiscipline({ nome: '', curso: '', descricao: '', carga_horaria: '', professor: '' });
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
    }
  };

  // Função para excluir disciplina (apenas Diretores)
  const handleDeleteDiscipline = async (id) => {
    if (!isGestor) return; // Segurança no frontend

    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta disciplina?');
    if (!confirmDelete) return; // Cancela se o usuário clicar em "Cancelar"

    try {
      await axios.delete(`http://127.0.0.1:8000/app/disciplinas/${id}/`, {
        headers: {
          Authorization: `Bearer ${authTokens.access}`,
        },
      });
      setDisciplinas(disciplinas.filter((disciplina) => disciplina.id !== id));
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>{isGestor ? 'Gerenciar Disciplinas' : 'Minhas Disciplinas'}</h1>

      {/* Formulário para adicionar disciplina (apenas Diretores) */}
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
            type="text"
            placeholder="Carga Horária"
            value={newDiscipline.carga_horaria}
            onChange={(e) => setNewDiscipline({ ...newDiscipline, carga_horaria: e.target.value })}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Professor Responsável"
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
            <p>
              <strong>Curso:</strong> {disciplina.curso}
            </p>
            <p>
              <strong>Carga Horária:</strong> {disciplina.carga_horaria}
            </p>
            <p>
              <strong>Descrição:</strong> {disciplina.descricao}
            </p>
            {isGestor && (
              <p>
                <strong>Professor:</strong> {disciplina.professor}
              </p>
            )}
            {isGestor && (
              <div className={styles.actionButtons}>
                <button onClick={() => alert('Funcionalidade de edição não implementada')}>
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