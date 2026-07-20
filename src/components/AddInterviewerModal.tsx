import { useState } from "react";
import { X, Loader2, UserCog } from "lucide-react";
import { CreateInterviewerInput } from "../api/scheduleApi";

const PALETTE = ["#4F46E5", "#0EA5A4", "#DB2777", "#D97706", "#059669", "#7C3AED", "#2563EB"];

interface Props {
  onClose: () => void;
  onCreate: (input: CreateInterviewerInput) => Promise<unknown>;
}

export function AddInterviewerModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [expertise, setExpertise] = useState("");
  const [colorTag, setColorTag] = useState(PALETTE[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        name: name.trim(),
        email: email.trim(),
        expertise: expertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colorTag,
      });
      onClose();
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? (err instanceof Error ? err.message : "Failed to add interviewer"));
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
            <UserCog size={16} className="text-accent-500" />
            <h2 className="font-display text-base font-semibold text-ink-900">Add interviewer</h2>
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
              placeholder="e.g. Rohan Das"
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
              placeholder="rohan.das@company.com"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">Expertise (comma-separated)</label>
            <input
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="Backend, System Design"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">Calendar color</label>
            <div className="flex gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorTag(c)}
                  className={`h-6 w-6 rounded-full border-2 ${colorTag === c ? "border-ink-900" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
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
            Add interviewer
          </button>
        </div>
      </form>
    </div>
  );
}
