const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  getTasks, getTask, createTask, updateTask, deleteTask
} = require('../controllers/taskController');

/**
 * @swagger
 * tags:
 *   name: Tarefas
 *   description: CRUD de tarefas com filtros e paginação
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Listar tarefas com filtros e paginação
 *     tags: [Tarefas]
 *     parameters:
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filtrar por ID do projeto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, review, done]
 *         description: Filtrar por status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta, urgente]
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filtrar por ID do responsável
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por título ou descrição
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Ordenação (ex. -createdAt, title, priority, dueDate)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista paginada de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
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
router.get('/', auth, getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obter tarefa por ID
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes da tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarefa não encontrada
 */
router.get('/:id', auth, getTask);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Criar nova tarefa
 *     tags: [Tarefas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, project]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Criar wireframes
 *               description:
 *                 type: string
 *                 example: Desenhar wireframes de todas as páginas
 *               project:
 *                 type: string
 *                 description: ID do projeto
 *               assignedTo:
 *                 type: string
 *                 description: ID do responsável
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [baixa, media, alta, urgente]
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-15"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ui", "design"]
 *     responses:
 *       201:
 *         description: Tarefa criada
 *       400:
 *         description: Dados inválidos
 */
router.post('/', auth, [
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('project').notEmpty().withMessage('Projeto é obrigatório')
], validate, createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Atualizar tarefa
 *     tags: [Tarefas]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [baixa, media, alta, urgente]
 *               dueDate:
 *                 type: string
 *                 format: date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 *       404:
 *         description: Tarefa não encontrada
 */
router.put('/:id', auth, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Remover tarefa
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa removida
 *       404:
 *         description: Tarefa não encontrada
 */
router.delete('/:id', auth, deleteTask);

module.exports = router;
