import { useEffect, useState } from "react";
import { X, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Candidate, Interviewer, InterviewSlot, CandidateStatus } from "../types";
import { toDateInputValue, localDateTimeToUtcIso, formatLocalTime, formatLocalDateTime } from "../utils/timezone";
import { ScheduleConflictError, CreateScheduleInput } from "../api/scheduleApi";
import { StatusBadge } from "./StatusBadge";
import { StatusToggle } from "./StatusToggle";

const DURATIONS = [30, 45, 60, 90];

interface CreateModalProps {
  mode: "create";
  interviewers: Interviewer[];
  candidates: Candidate[];
  selectedDate: Date;
  initialInterviewerId: string;
  initialStartMinutes: number; // minutes since local midnight
  onClose: () => void;
  onCreate: (input: CreateScheduleInput) => Promise<InterviewSlot>;
}

interface ViewModalProps {
  mode: "view";
  slot: InterviewSlot;
  onClose: () => void;
  onCancelSlot: (slotId: string) => Promise<void>;
  onSetStatus: (candidateId: string, status: CandidateStatus) => Promise<void>;
}

type Props = CreateModalProps | ViewModalProps;

function minutesToTimeInput(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function ScheduleModal(props: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-[2px]"
      onClick={props.onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-ink-100 bg-white shadow-2xl"
      >
        {props.mode === "create" ? <CreateForm {...props} /> : <ViewSlot {...props} />}
      </div>
    </div>
  );
}

function CreateForm({
  interviewers,
  candidates,
  selectedDate,
  initialInterviewerId,
  initialStartMinutes,
  onClose,
  onCreate,
}: CreateModalProps) {
  const [interviewerId, setInterviewerId] = useState(initialInterviewerId);
  const [candidateId, setCandidateId] = useState(candidates[0]?._id ?? "");
  const [date, setDate] = useState(toDateInputValue(selectedDate));
  const [time, setTime] = useState(minutesToTimeInput(initialStartMinutes));
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState<ScheduleConflictError | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setConflict(null);
    setFormError(null);
  }, [interviewerId, candidateId, date, time, duration]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!candidateId || !interviewerId) {
      setFormError("Choose a candidate and an interviewer.");
      return;
    }
    setSubmitting(true);
    setConflict(null);
    setFormError(null);
    try {
      const startTime = localDateTimeToUtcIso(date, time);
      const endTime = new Date(new Date(startTime).getTime() + duration * 60_000).toISOString();
      await onCreate({
        candidateId,
        interviewerId,
        startTime,
        endTime,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      if (err instanceof ScheduleConflictError) {
        setConflict(err);
      } else {
        setFormError(err instanceof Error ? err.message : "Failed to book interview");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const selectedInterviewer = interviewers.find((i) => i._id === interviewerId);

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-base font-semibold text-ink-900">Schedule interview</h2>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Candidate</label>
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
          >
            <option value="" disabled>
              Select a candidate
            </option>
            {candidates.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.positionAppliedFor}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Interviewer</label>
          <select
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
          >
            {interviewers.map((iv) => (
              <option key={iv._id} value={iv._id}>
                {iv.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">Start time (local)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Duration</label>
          <div className="flex gap-1.5">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                  duration === d
                    ? "border-accent-500 bg-accent-100 text-accent-600"
                    : "border-ink-200 text-ink-500 hover:border-ink-300"
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Round focus, panel context, etc."
            className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
          />
        </div>

        {conflict && (
          <div className="flex gap-2 rounded-lg border border-signal-rejected-bg bg-signal-rejected-bg px-3 py-2.5 text-signal-rejected">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold">409 — Double-booking blocked</p>
              <p className="mt-0.5">
                {selectedInterviewer?.name ?? "This interviewer"} is already booked with{" "}
                <span className="font-semibold">{conflict.conflictingCandidateName}</span> from{" "}
                {formatLocalTime(conflict.conflictingSlot.startTime)} to {formatLocalTime(conflict.conflictingSlot.endTime)}. Pick
                another time.
              </p>
            </div>
          </div>
        )}
        {formError && <p className="text-xs font-medium text-signal-rejected">{formError}</p>}
      </div>

      <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-500 hover:bg-ink-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-60"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Book interview
        </button>
      </div>
    </form>
  );
}

function ViewSlot({ slot, onClose, onCancelSlot, onSetStatus }: ViewModalProps) {
  const [cancelling, setCancelling] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState<CandidateStatus>(slot.candidate.status);

  async function handleCancel() {
    setCancelling(true);
    try {
      await onCancelSlot(slot._id);
      onClose();
    } finally {
      setCancelling(false);
    }
  }

  async function handleStatus(status: CandidateStatus) {
    setUpdating(true);
    try {
      await onSetStatus(slot.candidate._id, status);
      setLocalStatus(status);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h2 className="font-display text-base font-semibold text-ink-900">Interview details</h2>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">{slot.candidate.name}</p>
            <p className="text-xs text-ink-400">{slot.candidate.positionAppliedFor}</p>
          </div>
          <StatusBadge status={localStatus} />
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs font-medium text-ink-600">
          <Clock size={14} className="text-ink-400" />
          {formatLocalDateTime(slot.startTime)} – {formatLocalTime(slot.endTime)}
        </div>

        <div className="rounded-lg border border-ink-100 px-3 py-2 text-xs text-ink-500">
          <span className="font-semibold text-ink-700">Interviewer:</span> {slot.interviewer.name}
        </div>

        {slot.notes && <p className="rounded-lg border border-ink-100 px-3 py-2 text-xs text-ink-500">{slot.notes}</p>}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-500">Update status</label>
          <StatusToggle status={localStatus} onChange={handleStatus} disabled={updating} />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-500 hover:bg-ink-50"
        >
          Close
        </button>
        {slot.status !== "Cancelled" && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-1.5 rounded-lg border border-signal-rejected-bg bg-signal-rejected-bg px-4 py-2 text-sm font-semibold text-signal-rejected hover:bg-red-100 disabled:opacity-60"
          >
            {cancelling && <Loader2 size={14} className="animate-spin" />}
            Cancel slot
          </button>
        )}
      </div>
    </div>
  );
}
