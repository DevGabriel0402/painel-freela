# Painel do Freelancer (MVP)

Um sistema web completo, moderno e seguro para gestão de freelancers. Focado em produtividade agência-like, permite gerenciar clientes, projetos e fluxo financeiro com total isolamento de dados e autenticação robusta.

![Preview](preview.png)

## 🚀 Funcionalidades Principais

### 🔒 Autenticação e Segurança

- **Login e Registro Seguros**: Integração completa com **Firebase Authentication** (Email/Senha e Google).
- **Isolamento de Dados**: Cada usuário possui seu próprio "banco de dados" isolado na nuvem. Regras de segurança estritas garantem que um usuário jamais acesse os dados de outro.
- **Sessão Persistente**: O login é mantido mesmo se fechar o navegador.

### 📊 Dashboard Inteligente

- **Visão Geral**: Cards com Faturamento Mensal, Projetos Ativos e Tickets Médios.
- **Gráficos Dinâmicos**: Acompanhe seu progresso visualmente.
- **Metas**: Defina sua meta mensal e veja o progresso em tempo real.

### 👥 Gestão de Clientes

- Cadastro detalhado de clientes.
- Histórico de projetos vinculado a cada cliente.
- CRUD completo (Criar, Ler, Atualizar, Deletar).

### 💼 Gestão de Projetos (Jobs)

- **Status Workflow**: _A Fazer_, _Em Andamento_, _Concluído_.
- **Controle Financeiro**: Marque projetos como _Pagos_ ou _Pendentes_.
- **Prazos**: Defina datas de entrega e acompanhe atrasos.

### 🎨 Personalização e Configurações (Nuvem)

- **Dark/Light Mode**: Sua preferência de tema é salva na sua conta e sincronizada entre dispositivos.
- **Identidade da Marca**: Configure o Nome do seu Painel, Logo e Cor de Destaque (Accent Color).
- **Modo Privacidade**: Oculte valores financeiros com um clique (Blur Mode) para compartilhar sua tela ou trabalhar em público.

---

## 🛠️ Stack Tecnológico

O projeto foi construído com ferramentas modernas focadas em performance e escalabilidade:

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização**: [Styled Components](https://styled-components.com/) (CSS-in-JS)
- **Backend as a Service (BaaS)**: [Firebase](https://firebase.google.com/)
  - **Auth**: Gestão de identidades.
  - **Firestore**: Banco de dados NoSQL em tempo real.
- **Charts**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Roteamento**: [React Router v6](https://reactrouter.com/)

---

## 📦 Instalação e Configuração

### 1. Pré-requisitos

- Node.js (v16 ou superior)
- Conta no Google Firebase

### 2. Clone o Projeto

```bash
git clone https://github.com/seu-usuario/painel-freelancer.git
cd painel-cliente
```

### 3. Instale as Dependências

```bash
npm install
```

### 4. Configuração do Firebase

Crie um arquivo `.env` na raiz do projeto com suas credenciais do Firebase:

```env
VITE_FB_API_KEY=sua_api_key
VITE_FB_AUTH_DOMAIN=seu_auth_domain
VITE_FB_PROJECT_ID=seu_project_id
VITE_FB_STORAGE_BUCKET=seu_storage_bucket
VITE_FB_MESSAGING_SENDER_ID=seu_messaging_id
VITE_FB_APP_ID=seu_app_id
```

### 5. Regras de Segurança (Firestore Rules)

Para garantir o isolamento dos dados, configure as regras do seu Firestore Console assim:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // O usuário só pode ler/escrever na SUA própria pasta
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Regras recursivas para todas as subcoleções (clients, jobs, settings)
      match /clients/{clientId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /jobs/{jobId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /settings/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 6. Rode o Projeto

```bash
npm run dev
```

---

## 📁 Estrutura de Pastas

- **`/src/app`**: Serviços centrais (Auth, Firestore, Contextos).
- **`/src/components`**: Biblioteca de UI (Botões, Modais, Inputs) e Layout.
- **`/src/pages`**: Telas da aplicação (Login, Dashboard, Clientes...).
- **`/src/styles`**: Temas e Estilos Globais.

---

## 🛡️ Privacidade e Dados

Seus dados são seus. Toda a informação (Clientes, Faturamento, Configurações) é estruturada em `users/{SEU_UID}`.
Nenhum outro usuário tem permissão de leitura sobre seus dados devido às regras de segurança implementadas (Row Level Security via Firestore Rules).

---

Desenvolvido com ❤️ e IA.
