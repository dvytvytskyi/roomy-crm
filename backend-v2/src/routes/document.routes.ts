import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/v2/properties/:propertyId/documents
 * @desc Get all documents for a specific property
 * @access Private (JWT required)
 */
router.get('/:propertyId/documents', authenticateToken, DocumentController.getDocuments);

/**
 * @route POST /api/v2/properties/:propertyId/documents
 * @desc Upload a document for a specific property
 * @access Private (JWT required)
 */
router.post('/:propertyId/documents', authenticateToken, DocumentController.uploadDocument);

/**
 * @route GET /api/v2/properties/:propertyId/documents/:documentId/download
 * @desc Get download URL for a specific document
 * @access Private (JWT required)
 */
router.get('/:propertyId/documents/:documentId/download', authenticateToken, DocumentController.getDownloadUrl);

/**
 * @route DELETE /api/v2/properties/:propertyId/documents/:documentId
 * @desc Delete a document for a specific property
 * @access Private (JWT required)
 */
router.delete('/:propertyId/documents/:documentId', authenticateToken, DocumentController.deleteDocument);

export default router;

