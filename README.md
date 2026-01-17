# 🚀 Painel Cliente MVP

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=flat&logo=firebase)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)

> Um sistema moderno e responsivo para gestão de clientes e jobs freelance, com autenticação segura e controle financeiro integrado.

---

## 📸 Screenshots

<div align="center">
  <img src="https://placehold.co/800x450/1e1e1e/FFF?text=Dashboard+Vis%C3%A3o+Geral" alt="Dashboard" width="800"/>
  <br/>
  <em>Visão Geral da Dashboard com Gráficos e Metas</em>
</div>

<br/>

<div align="center">
  <div style="display: flex; gap: 10px; justify-content: center;">
    <img src="https://placehold.co/400x300/1e1e1e/FFF?text=Lista+de+Clientes" alt="Clientes" width="45%" />
    <img src="https://placehold.co/400x300/1e1e1e/FFF?text=Gest%C3%A3o+de+Jobs" alt="Jobs" width="45%" />
  </div>
  <em>Gerenciamento intuitivo de Clientes e Projetos</em>
</div>

---

## ✨ Funcionalidades Principais

- **🔐 Autenticação Segura**: Login e Registro integrados com Firebase Auth.
- **👥 Gestão de Clientes**: CRUD completo com avatares automáticos (Iniciais).
- **💼 Controle de Jobs**: Acompanhamento de projetos, prazos e valores.
- **💰 Dashboard Financeira**:
  - Resumo de ganhos anuais e mensais.
  - Gráficos visuais (Recharts).
  - Definição de metas mensais.
  - Curva ABC de clientes.
- **🎨 UI/UX Premium**:
  - **Dark/Light Mode** automático sincronizado com o banco.
  - Interface limpa e responsiva (Mobile-First).
  - Modais de confirmação para ações críticas.
  - Máscaras de input inteligentes (Telefone, Moeda).
- **🛡️ Painel Admin**: Controle de permissões de usuários e limpeza de dados (apenas para admin).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js (Vite)
- **Estilização**: Styled-Components + Lucide React (Ícones)
- **Backend/Database**: Firebase (Authentication & Firestore)
- **Charts**: Recharts
- **Router**: React Router Dom v7

---

## � Como Executar

Clone o projeto e instale as dependências:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/painel-cliente.git

# Entre na pasta
cd painel-cliente

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

> **Nota**: É necessário configurar as variáveis de ambiente do Firebase em um arquivo `.env` na raiz do projeto.

---

## � Autor

Desenvolvido com ❤️ por **Gabriel**.

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/seu-perfil)
