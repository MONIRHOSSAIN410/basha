import asyncHandler from 'express-async-handler';
import DemandNote, { APPROVAL_STAGES } from '../models/DemandNote.js';

const STAGE_TO_STATUS = {
  auditor: 'auditor_approved',
  treasurer: 'treasurer_approved',
  general_secretary: 'secretary_approved',
  president: 'president_approved',
};

// @desc    List demand notes (চাহিদাপত্র), optionally filtered by status
// @route   GET /api/demand-notes
export const getDemandNotes = asyncHandler(async (req, res) => {
  const { status, fund } = req.query;
  const query = {};
  if (status) query.status = status;
  if (fund) query.fund = fund;

  const items = await DemandNote.find(query).sort({ createdAt: -1 }).populate('relatedExpense', 'amount date');
  res.status(200).json({ success: true, items });
});

// @desc    Get one demand note
// @route   GET /api/demand-notes/:id
export const getDemandNoteById = asyncHandler(async (req, res) => {
  const note = await DemandNote.findById(req.params.id).populate('relatedExpense');
  if (!note) {
    res.status(404);
    throw new Error('চাহিদাপত্র পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, item: note });
});

// @desc    Create a new demand note (advance-cash request), starts at "pending"
// @route   POST /api/demand-notes
export const createDemandNote = asyncHandler(async (req, res) => {
  const note = await DemandNote.create(req.body);
  res.status(201).json({ success: true, item: note });
});

// @desc    Record a sign-off at one stage of the approval chain
//          (নিরীক্ষক -> অর্থ সম্পাদক -> সাধারণ সম্পাদক -> সভাপতি)
// @route   POST /api/demand-notes/:id/approve
// @body    { stage: 'auditor'|'treasurer'|'general_secretary'|'president', approverName, remarks }
export const approveDemandNote = asyncHandler(async (req, res) => {
  const { stage, approverName, remarks } = req.body;

  if (!APPROVAL_STAGES.includes(stage)) {
    res.status(400);
    throw new Error('সঠিক approval stage দিন');
  }
  if (!approverName) {
    res.status(400);
    throw new Error('অনুমোদনকারীর নাম দিন');
  }

  const note = await DemandNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('চাহিদাপত্র পাওয়া যায়নি');
  }
  if (note.status === 'rejected' || note.status === 'paid') {
    res.status(400);
    throw new Error('এই চাহিদাপত্রটি ইতিমধ্যে বন্ধ হয়ে গেছে (rejected/paid)');
  }

  note.approvals.push({ stage, approverName, remarks });
  note.status = STAGE_TO_STATUS[stage];
  await note.save();

  res.status(200).json({ success: true, item: note });
});

// @desc    Reject a demand note at any stage
// @route   POST /api/demand-notes/:id/reject
export const rejectDemandNote = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const note = await DemandNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('চাহিদাপত্র পাওয়া যায়নি');
  }
  note.status = 'rejected';
  note.rejectionReason = reason || 'কোনো কারণ উল্লেখ করা হয়নি';
  await note.save();
  res.status(200).json({ success: true, item: note });
});

// @desc    Mark a fully-approved demand note as paid, linking it to the actual expense record
// @route   POST /api/demand-notes/:id/mark-paid
export const markDemandNotePaid = asyncHandler(async (req, res) => {
  const { expenseId } = req.body;
  const note = await DemandNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('চাহিদাপত্র পাওয়া যায়নি');
  }
  if (note.status !== 'president_approved') {
    res.status(400);
    throw new Error('সব ধাপে অনুমোদনের আগে পরিশোধ করা যাবে না');
  }
  note.status = 'paid';
  if (expenseId) note.relatedExpense = expenseId;
  await note.save();
  res.status(200).json({ success: true, item: note });
});

// @desc    Delete a demand note
// @route   DELETE /api/demand-notes/:id
export const deleteDemandNote = asyncHandler(async (req, res) => {
  const note = await DemandNote.findByIdAndDelete(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('চাহিদাপত্র পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, message: 'মুছে ফেলা হয়েছে' });
});
