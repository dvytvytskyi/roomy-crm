import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD operations
router.get('/', TaskController.getTasks);
router.get('/stats', TaskController.getTaskStats);
router.get('/:id', TaskController.getTaskById);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

// Task status management
router.put('/:id/status', TaskController.updateTaskStatus);

// Task comments
router.post('/:id/comments', TaskController.addTaskComment);

// Task checklist
router.put('/:id/checklist/:itemId', TaskController.updateChecklistItem);

// Task attachments
router.post('/:id/attachments', uploadSingle('attachment'), handleUploadError, TaskController.uploadTaskAttachment);

export default router;
