# Gestão de Tarefas — API Profissional

API RESTful de gestão de tarefas e projetos com documentação Swagger completa.

## Tecnologias

### Backend
- Node.js + Express
- MongoDB (Memory Server)
- JWT para autenticação
- Swagger/OpenAPI para documentação
- express-validator para validação
- express-rate-limit + Helmet para segurança

### Frontend
- React 18 + Vite
- React Router DOM
- Axios
- Layout Sidebar com tema verde/teal
- Dark mode toggle

## Funcionalidades

- **Autenticação** — Registro, login, JWT
- **Projetos** — CRUD completo com filtros, paginação, tags
- **Tarefas** — CRUD com board Kanban, filtros avançados
- **Dashboard** — Estatísticas em tempo real
- **API Docs** — Swagger UI em `/api-docs`
- **Dark Mode** — Toggle com persistência

## Como Executar

```bash
# Backend
cd backend
npm install
node server.js
# → API: http://localhost:5002
# → Swagger: http://localhost:5002/api-docs

# Frontend
cd client
npm install
npm run dev
# → App: http://localhost:3002
```

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Registrar |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Perfil |
| GET | /api/projects | Listar projetos |
| GET | /api/projects/stats | Estatísticas |
| GET | /api/projects/:id | Detalhe do projeto |
| POST | /api/projects | Criar projeto |
| PUT | /api/projects/:id | Atualizar projeto |
| DELETE | /api/projects/:id | Remover projeto |
| GET | /api/tasks | Listar tarefas |
| GET | /api/tasks/:id | Detalhe da tarefa |
| POST | /api/tasks | Criar tarefa |
| PUT | /api/tasks/:id | Atualizar tarefa |
| DELETE | /api/tasks/:id | Remover tarefa |

## Autor

Luther — [GitHub](https://github.com/Luthercode)
