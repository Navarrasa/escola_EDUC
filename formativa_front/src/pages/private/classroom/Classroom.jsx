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
    capacidade: '',
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
    // console.log('Periodos:', response.data);
    setPeriodos(response.data);
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
    if (!newClassroom.nome || !newClassroom.curso || !newClassroom.capacidade || !newClassroom.professor || !newClassroom.periodo) {
    setError('Preencha todos os campos obrigatórios.');
    return;
    }
    const capacidade = Number(newClassroom.capacidade);
    if (isNaN(capacidade) || capacidade <= 0) {
    setError('A capacidade deve ser um número positivo.');
    return;
    }

    // variável para facilitar o envio do payload
    // payload é um objeto que contém os dados da nova sala de aula
    // e é usado para enviar os dados para a API
    const payload = {
    nome: newClassroom.nome,
    curso: newClassroom.curso,
    capacidade: capacidade, 
    periodo: newClassroom.periodo, 
    professor: Number(newClassroom.professor), 
    descricao: newClassroom.descricao || null, 
    };

    try {
    if (editingClassroom) {
    const response = await axios.patch(
    `${API_BASE_URL}/salas/${editingClassroom.id}`,
    payload,
    { headers: { Authorization: `Bearer ${authTokens.access}` }}
    );
    // Atualiza a sala de aula editada na lista
    // setClassrooms é uma função que atualiza o estado de classrooms
    setClassrooms(classrooms.map((c) => (c.id === editingClassroom.id ? response.data : c)));
    setEditingClassroom(null);
    } else {
    const response = await axios.post(
    `${API_BASE_URL}/salas/`,
    payload,
    { headers: { Authorization: `Bearer ${authTokens.access}` } }
    );
    setClassrooms([...classrooms, response.data]);
    }
    // Limpa o formulário e reseta o estado de erro
    setNewClassroom({ nome: '', curso: '', capacidade: '', periodo: '', professor: '', descricao: '' });
    setError(null);
    } catch (error) {
    const errorData = error.response?.data;
    if (errorData?.error?.includes('professor')) {
    setError('Este professor já está associado a outra sala.');
    } else {
    console.log(error);
    setError(errorData?.detail || 'Este professor já está associado a outra sala.');
    }
    // console.error('Error response:', errorData);
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
    capacidade: classrooms.capacidade,
    periodo: classrooms.periodo.toString(),
    professor: classrooms.professor.toString(),
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
    await axios.delete(`${API_BASE_URL}/salas/${id}`, {
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
<form onSubmit={handleSubmit} className={styles.form_container}>
<div className={styles.form_grid}>
<div>
  <label className={styles.input_label}>Nome da Sala</label>
  <input
  className={styles.input_field}
  type="text"
  placeholder="Nome da Sala*"
  value={newClassroom.nome}
  onChange={(e) => setNewClassroom({ ...newClassroom, nome: e.target.value })}
  aria-label="Nome da Sala"
  />
</div>
<div>
  <label className={styles.input_label}>Curso</label>
  <input
 className={styles.input_field}
  type="text"
  placeholder="Curso*"
  value={newClassroom.curso}
  onChange={(e) => setNewClassroom({ ...newClassroom, curso: e.target.value })}
  aria-label="Curso"
  />
</div>
<div>
  <label className={styles.input_label}>Capacidade</label>
  <input
  className={styles.input_field}
  type="number"
  placeholder="Quantidade de Alunos*"
  value={newClassroom.capacidade}
  onChange={(e) => setNewClassroom({ ...newClassroom, capacidade: e.target.value })}
  aria-label="Quantidade de Alunos"
  />
</div>
<div>
  <label className={styles.input_label}>Período</label>
  <select
  className={styles.input_field}
  value={newClassroom.periodo}
  onChange={(e) => setNewClassroom({ ...newClassroom, periodo: e.target.value })}
  aria-label="Período"
  >
  <option value="">Período da Aula*</option>
  {periodo.map((p) => (
  <option key={p.value} value={p.value}>
  {p.label}
  </option>
  ))}
  </select>
</div>
<div>
  <label className={styles.input_label}>Professor</label>
  <select
  className={styles.input_field}
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
</div>
<div>
  
  <label className={styles.input_label}>Descrição</label>
  <textarea
  className={styles.input_field}
  placeholder="Descrição da Aula"
  value={newClassroom.descricao}
  onChange={(e) => setNewClassroom({ ...newClassroom, descricao: e.target.value })}
  aria-label="Descrição da Aula"
  />
</div>
</div>

<div className={styles.btn_container}>
<button type="submit" className={styles.submit_btn}>
{editingClassroom ? 'Salvar Alterações' : 'Adicionar Sala de Aula'}
</button>
{editingClassroom && (
<button
type="button"
className={styles.cancel_btn}
onClick={() => {
setEditingClassroom(null);
setNewClassroom({ nome: '', curso: '', descricao: '', capacidade: '', professor: '' });
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
{classrooms.map((classroom) => (
<div key={classroom.id} className={styles.card}>
<h3>{classroom.nome}</h3>
<p><strong>Curso:</strong> {classroom.curso}</p>
<p><strong>Capacidade:</strong> {classroom.capacidade}</p>
<p><strong>Descrição:</strong> {classroom.descricao}</p>
{isGestor && (
<p><strong>Professor:</strong> {getProfessorName(classroom.professor)}</p>
)}
{isGestor && (
<div className={styles.btn_container}>
<button onClick={() => startEditing(classroom)} className={styles.action_btn}>Editar</button>
<button onClick={() => handleDeleteClassroom(classroom.id)} className={styles.action_btn}>Excluir</button>
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
