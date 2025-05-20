# Escola EDUC

## Visão Geral
O projeto **Escola EDUC** é uma aplicação desenvolvida para gerenciar atividades educacionais, proporcionando uma interface amigável e um backend robusto para suportar funcionalidades administrativas e de usuários.

## Tecnologias Utilizadas
- **Frontend**: React + Vite
- **Backend**: Python + Django Rest Framework

## Como Baixar Dependências e Iniciar o Servidor

### Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas:
- Node.js (versão 18 ou superior) para o frontend
- Python (versão 3.8 ou superior) para o backend
- Gerenciador de pacotes npm ou yarn para o frontend
- pip para o backend

### Passos para Configuração

#### 1. Clonar o Repositório
```bash
git clone https://github.com/Navarrasa/formativa-2dsmb.git
cd escola_EDUC
```

#### 2. Configurar o Frontend (React + Vite)
Navegue até o diretório do frontend:
```bash
cd formativa_frontend
```
Instale as dependências:
```bash
npm install
# ou
yarn install
```
Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```
O frontend estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

#### 3. Configurar o Backend (Django Rest Framework)
Navegue até o diretório do backend:
```bash
cd ../formativa_back
```
Crie e ative um ambiente virtual (opcional, mas recomendado):
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```
Instale as dependências:
```bash
pip install -r requirements.txt
```
Aplique as migrações do banco de dados:
```bash
python manage.py migrate
```
Inicie o servidor do backend:
```bash
python manage.py runserver
```
O backend estará disponível em `http://localhost:8000`.

### Notas Adicionais
- Certifique-se de configurar as variáveis de ambiente (como `DJANGO_SECRET_KEY` para o backend e URLs de API no frontend) em um arquivo `.env`.
- Para production, considere usar um servidor WSGI como Gunicorn para o Django e um servidor estático para o frontend.
- Para acessar a documentação publicada via PostMan, acesse o link abaixo!
    https://documenter.getpostman.com/view/41755860/2sB2qZDN1Y