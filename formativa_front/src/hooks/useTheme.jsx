import { useEffect, useState } from 'react';

// Hook para gerenciar o tema (light ou dark) com persistência no localStorage
export function useTheme() {
  // Inicializa o tema com o valor do localStorage ou 'light' como padrão
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Aplica o tema ao documento e atualiza no localStorage quando o tema mudar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para alternar entre temas claro e escuro
  const changeTheme = (selectedTheme) => {
    const normalizedTheme = selectedTheme.toLowerCase() === 'claro' ? 'light' : 'dark';
    setTheme(normalizedTheme);
  };

  return { theme, changeTheme };
}