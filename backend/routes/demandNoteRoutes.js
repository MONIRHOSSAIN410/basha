import express from 'express';
import {
  getDemandNotes,
  getDemandNoteById,
  createDemandNote,
  approveDemandNote,
  rejectDemandNote,
  markDemandNotePaid,
  deleteDemandNote,
} from '../controllers/demandNoteController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getDemandNotes).post(createDemandNote);
router.route('/:id').get(getDemandNoteById).delete(deleteDemandNote);
router.post('/:id/approve', approveDemandNote);
router.post('/:id/reject', rejectDemandNote);
router.post('/:id/mark-paid', markDemandNotePaid);

export default router;
