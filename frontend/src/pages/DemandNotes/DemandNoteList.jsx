import { useEffect, useState, useCallback } from 'react';
import { Plus, ThumbsDown, ThumbsUp, Banknote, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Loader from '../../components/ui/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Field, Input, Textarea } from '../../components/ui/Field.jsx';
import { formatBDT, formatDate } from '../../utils/formatCurrency';
import { FUND_LABELS, APPROVAL_STAGE_LABELS, DEMAND_NOTE_STATUS_LABELS } from '../../utils/constants';
import DemandNoteFormModal from './DemandNoteFormModal.jsx';
import ApprovalStepper from './ApprovalStepper.jsx';

const NEXT_STAGE_BY_STATUS = {
  pending: 'auditor',
  auditor_approved: 'treasurer',
  treasurer_approved: 'general_secretary',
  secretary_approved: 'president',
};

const STATUS_TONE = {
  pending: 'slate',
  auditor_approved: 'amber',
  treasurer_approved: 'amber',
  secretary_approved: 'amber',
  president_approved: 'green',
  paid: 'primary',
  rejected: 'red',
};

export default function DemandNoteList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null); // { note, stage }
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approverName, setApproverName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/demand-notes');
      setItems(data.items);
    } catch (err) {
      toast.error(err.response?.data?.message || 'তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleApprove = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/demand-notes/${approveTarget.note._id}/approve`, {
        stage: approveTarget.stage,
        approverName,
        remarks,
      });
      toast.success('অনুমোদন করা হয়েছে');
      setApproveTarget(null);
      setApproverName('');
      setRemarks('');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'অনুমোদন করা যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/demand-notes/${rejectTarget._id}/reject`, { reason: rejectReason });
      toast.success('বাতিল করা হয়েছে');
      setRejectTarget(null);
      setRejectReason('');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'বাতিল করা যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (note) => {
    if (!window.confirm('এই চাহিদাপত্রটি পরিশোধিত হিসেবে চিহ্নিত করবেন?')) return;
    try {
      await api.post(`/demand-notes/${note._id}/mark-paid`, {});
      toast.success('পরিশোধিত হিসেবে চিহ্নিত করা হয়েছে');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'সম্ভব হয়নি');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/demand-notes/${id}`);
      toast.success('মুছে ফেলা হয়েছে');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'মুছে ফেলা যায়নি');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 sm:text-2xl">
            চাহিদাপত্র ও অনুমোদন ওয়ার্কফ্লো
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            নিরীক্ষক → অর্থ সম্পাদক → সাধারণ সম্পাদক → সভাপতি — ধাপে ধাপে অনুমোদন
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          নতুন চাহিদাপত্র
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState message="কোনো চাহিদাপত্র নেই" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((note) => {
            const nextStage = NEXT_STAGE_BY_STATUS[note.status];
            return (
              <Card key={note._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-100">{note.purpose}</p>
                    <p className="text-xs text-slate-400">
                      {FUND_LABELS[note.fund]} • আবেদনকারীঃ {note.requestedBy} • {formatDate(note.dateRequested)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[note.status]}>{DEMAND_NOTE_STATUS_LABELS[note.status]}</Badge>
                </div>

                <p className="mt-3 text-lg font-semibold text-primary-700 dark:text-primary-400">
                  {formatBDT(note.amountRequested)}
                </p>

                <div className="mt-4">
                  <ApprovalStepper note={note} />
                </div>

                {note.status === 'rejected' && note.rejectionReason && (
                  <p className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
                    বাতিলের কারণঃ {note.rejectionReason}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {nextStage && (
                    <>
                      <Button
                        variant="primary"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => setApproveTarget({ note, stage: nextStage })}
                      >
                        <ThumbsUp size={14} />
                        {APPROVAL_STAGE_LABELS[nextStage]} হিসেবে অনুমোদন
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => setRejectTarget(note)}
                      >
                        <ThumbsDown size={14} />
                        বাতিল
                      </Button>
                    </>
                  )}
                  {note.status === 'president_approved' && (
                    <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => handleMarkPaid(note)}>
                      <Banknote size={14} />
                      পরিশোধিত হিসেবে চিহ্নিত করুন
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="ml-auto rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DemandNoteFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setCreateOpen(false);
          fetchItems();
        }}
      />

      <Modal
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        title={approveTarget ? `${APPROVAL_STAGE_LABELS[approveTarget.stage]} হিসেবে অনুমোদন করুন` : ''}
      >
        <form onSubmit={handleApprove}>
          <Field label="অনুমোদনকারীর নাম" required>
            <Input required value={approverName} onChange={(e) => setApproverName(e.target.value)} />
          </Field>
          <Field label="মন্তব্য">
            <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setApproveTarget(null)}>
              বাতিল
            </Button>
            <Button type="submit" loading={submitting}>
              নিশ্চিত করুন
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} title="চাহিদাপত্র বাতিল করুন">
        <form onSubmit={handleReject}>
          <Field label="বাতিলের কারণ" required>
            <Textarea rows={3} required value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setRejectTarget(null)}>
              ফিরে যান
            </Button>
            <Button variant="danger" type="submit" loading={submitting}>
              বাতিল নিশ্চিত করুন
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
