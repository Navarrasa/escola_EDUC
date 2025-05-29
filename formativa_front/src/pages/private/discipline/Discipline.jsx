import React, { useState, useEffect, useContext } from 'react'; // State guarda o estado atual, Effect mostra isso na tela
import axios from 'axios'; // Chamar a API das disciplinas
import AuthContext from '../../../hooks/AuthContext';

export function Discipline() {
    // Variável que vai receber os dados da API, e é controlada pelo State
    const [disciplina, setDisciplina] = useState([]);
    const { user, authTokens  } = useContext(AuthContext);

    // ()parâmetros, {}script, []dependencias
    useEffect(() => {
        if (!user || !user.ni || !authTokens?.access) return;

        const token = authTokens.access;
        const ni = user.ni;

        axios.get(`http://127.0.0.1:8000/app/disciplinas/professores/${ni}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setDisciplina(response.data);
        })
        .catch(error => {
            console.error("Erro ao buscar disciplinas:", error);
        });
    }, [user, authTokens]);


    return (
        <div className="container">
            <h1>Minhas Disciplinas</h1>

            <div>
                {disciplina.map(disciplina=>(

                    <div key={disciplina.id}>
                        <h3>{disciplina.nome}</h3>
                        <p><strong>Curso:</strong>{disciplina.curso}</p>
                        <p><strong>Descrição:</strong>{disciplina.descricao}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Discipline;