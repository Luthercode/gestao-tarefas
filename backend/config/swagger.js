const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestão de Tarefas e Projetos',
      version: '1.0.0',
      description: `
API RESTful profissional para gestão de tarefas e projetos.

## Funcionalidades
- **Autenticação** com JWT (registro, login, perfil)
- **Projetos** — CRUD completo com membros
- **Tarefas** — CRUD com filtros, paginação e ordenação
- **Validação** de dados com express-validator
- **Rate Limiting** para proteção contra abusos
- **Segurança** com Helmet

## Autenticação
Todas as rotas (exceto registro e login) exigem token JWT.
Envie o header: \`Authorization: Bearer <token>\`
      `,
      contact: {
        name: 'Luther',
        url: 'https://github.com/Luthercode'
      }
    },
    servers: [
      { url: 'http://localhost:5002', description: 'Servidor de Desenvolvimento' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Luther' },
            email: { type: 'string', format: 'email', example: 'luther@exemplo.com' },
            role: { type: 'string', enum: ['admin', 'membro'], example: 'admin' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Redesign completo do site corporativo' },
            status: { type: 'string', enum: ['planejamento', 'em-andamento', 'pausado', 'concluido', 'cancelado'] },
            priority: { type: 'string', enum: ['baixa', 'media', 'alta', 'urgente'] },
            owner: { type: 'string', description: 'ID do proprietário' },
            members: { type: 'array', items: { type: 'string' }, description: 'IDs dos membros' },
            deadline: { type: 'string', format: 'date' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Criar wireframes' },
            description: { type: 'string', example: 'Desenhar wireframes de todas as páginas' },
            project: { type: 'string', description: 'ID do projeto' },
            assignedTo: { type: 'string', description: 'ID do usuário atribuído' },
            status: { type: 'string', enum: ['todo', 'in-progress', 'review', 'done'] },
            priority: { type: 'string', enum: ['baixa', 'media', 'alta', 'urgente'] },
            dueDate: { type: 'string', format: 'date' },
            tags: { type: 'array', items: { type: 'string' } },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Acesso negado' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
