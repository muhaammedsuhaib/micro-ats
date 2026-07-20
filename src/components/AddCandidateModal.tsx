import { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { CreateCandidateInput } from "../api/scheduleApi";

interface Props {
  onClose: () => void;
  onCreate: (input: CreateCandidateInput) => Promise<unknown>;
}

export function AddCandidateModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !position.trim()) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ name: name.trim(), email: email.trim(), positionAppliedFor: position.trim() });
      onClose();
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? // Axios error shape — surface the backend's message (e.g. duplicate email -> 409)
            (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? (err instanceof Error ? err.message : "Failed to add candidate"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-accent-500" />
            <h2 className="font-display text-base font-semibold text-ink-900">Add candidate</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Divya Krishnan"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="divya.krishnan@example.com"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">Position applied for</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Backend Engineer"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
            />
          </div>
          {error && <p className="text-xs font-medium text-signal-rejected">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-500 hover:bg-ink-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Add candidate
          </button>
        </div>
      </form>
    </div>
  );
}
