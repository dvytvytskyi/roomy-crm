import { Router } from 'express';
import { GuestDocumentController } from '../controllers/guest-document.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/v2/guests/:guestId/documents
 * @desc Get all documents for a specific guest
 * @access Private (JWT required)
 */
router.get('/:guestId/documents', authenticateToken, GuestDocumentController.getDocuments);

/**
 * @route POST /api/v2/guests/:guestId/documents
 * @desc Upload a document for a specific guest
 * @access Private (JWT required)
 */
router.post('/:guestId/documents', authenticateToken, GuestDocumentController.uploadDocument);

/**
 * @route GET /api/v2/guests/:guestId/documents/:documentId/download
 * @desc Get download URL for a specific document
 * @access Private (JWT required)
 */
router.get('/:guestId/documents/:documentId/download', authenticateToken, GuestDocumentController.getDownloadUrl);

/**
 * @route DELETE /api/v2/guests/:guestId/documents/:documentId
 * @desc Delete a document for a specific guest
 * @access Private (JWT required)
 */
router.delete('/:guestId/documents/:documentId', authenticateToken, GuestDocumentController.deleteDocument);

export default router;
