import mongoose from 'mongoose';

// Digital version of the "চাহিদাপত্র" (demand/requisition note) + its sign-off chain,
// described in section 11.1 of the bidhi:
// নিরীক্ষা বিভাগ -> অর্থ বিভাগ (Treasurer) -> সাধারণ সম্পাদক -> সভাপতি
export const APPROVAL_STAGES = ['auditor', 'treasurer', 'general_secretary', 'president'];

export const DEMAND_NOTE_STATUS = [
  'pending',
  'auditor_approved',
  'treasurer_approved',
  'secretary_approved',
  'president_approved', // fully approved, ready to disburse
  'rejected',
  'paid',
];

const approvalSchema = new mongoose.Schema(
  {
    stage: { type: String, enum: APPROVAL_STAGES, required: true },
    approverName: { type: String, trim: true, required: true },
    approvedAt: { type: Date, default: Date.now },
    remarks: { type: String, trim: true },
  },
  { _id: false }
);

const demandNoteSchema = new mongoose.Schema(
  {
    fund: { type: String, enum: ['mosque', 'madrasha', 'orphan_poor_fund'], required: true },
    purpose: { type: String, required: true, trim: true },
    amountRequested: { type: Number, required: true, min: 1 },
    requestedBy: { type: String, trim: true, required: true },
    dateRequested: { type: Date, default: Date.now },
    status: { type: String, enum: DEMAND_NOTE_STATUS, default: 'pending' },
    approvals: [approvalSchema],
    rejectionReason: { type: String, trim: true },
    relatedExpense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  },
  { timestamps: true }
);

demandNoteSchema.index({ status: 1, dateRequested: -1 });

const DemandNote = mongoose.model('DemandNote', demandNoteSchema);

export default DemandNote;
