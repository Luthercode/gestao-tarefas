const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  getProjects, getProjectStats, getProject,
  createProject, updateProject, deleteProject
} = require('../controllers/projectController');

/**
 * @swagger
 * tags:
 *   name: Projetos
 *   description: CRUD completo de projetos
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Listar projetos do usuário
 *     tags: [Projetos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planejamento, em-andamento, pausado, concluido, cancelado]
 *         description: Filtrar por status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta, urgente]
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome ou descrição
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Ordenação (ex. -createdAt, name, deadline)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista paginada de projetos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', auth, getProjects);

/**
 * @swagger
 * /api/projects/stats:
 *   get:
 *     summary: Estatísticas dos projetos e tarefas
 *     tags: [Projetos]
 *     responses:
 *       200:
 *         description: Estatísticas agregadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProjects:
 *                   type: integer
 *                 totalTasks:
 *                   type: integer
 *                 completedTasks:
 *                   type: integer
 *                 completionRate:
 *                   type: integer
 *                   description: Porcentagem de conclusão
 *                 byStatus:
 *                   type: object
 *                 byPriority:
 *                   type: object
 */
router.get('/stats', auth, getProjectStats);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obter projeto por ID (com tarefas)
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do projeto
 *     responses:
 *       200:
 *         description: Projeto com suas tarefas
 *       404:
 *         description: Projeto não encontrado
 */
router.get('/:id', auth, getProject);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Criar novo projeto
 *     tags: [Projetos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Website Redesign
 *               description:
 *                 type: string
 *                 example: Redesign completo do site corporativo
 *               status:
 *                 type: string
 *                 enum: [planejamento, em-andamento, pausado, concluido, cancelado]
 *               priority:
 *                 type: string
 *                 enum: [baixa, media, alta, urgente]
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-30"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["frontend", "design"]
 *     responses:
 *       201:
 *         description: Projeto criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Dados inválidos
 */
router.post('/', auth, [
  body('name').notEmpty().withMessage('Nome do projeto é obrigatório')
], validate, createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Atualizar projeto
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Projeto atualizado
 *       404:
 *         description: Projeto não encontrado
 */
router.put('/:id', auth, updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Remover projeto e suas tarefas
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projeto removido
 *       404:
 *         description: Projeto não encontrado
 */
router.delete('/:id', auth, deleteProject);

module.exports = router;
