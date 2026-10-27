import { Check, X, Clock } from 'lucide-react';
import { APPROVAL_STAGE_LABELS } from '../../utils/constants';

const STAGES = ['auditor', 'treasurer', 'general_secretary', 'president'];

export default function ApprovalStepper({ note }) {
  const approvedStages = new Set(note.approvals.map((a) => a.stage));
  const isRejected = note.status === 'rejected';

  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((stage, idx) => {
        const done = approvedStages.has(stage);
        const approval = note.approvals.find((a) => a.stage === stage);
        return (
          <div key={stage} className="flex items-center gap-1.5">
            <div
              title={approval ? `${APPROVAL_STAGE_LABELS[stage]}: ${approval.approverName}` : APPROVAL_STAGE_LABELS[stage]}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                isRejected
                  ? 'bg-rose-100 text-rose-500 dark:bg-rose-900/40'
                  : done
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              {isRejected ? <X size={14} /> : done ? <Check size={14} /> : <Clock size={13} />}
            </div>
            {idx < STAGES.length - 1 && (
              <div className={`h-0.5 w-4 sm:w-6 ${done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
