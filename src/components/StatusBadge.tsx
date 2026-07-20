import { CandidateStatus } from "../types";

const STYLES: Record<CandidateStatus, string> = {
  Applied: "bg-ink-100 text-ink-600",
  "Technical Round": "bg-signal-technical-bg text-signal-technical",
  Offered: "bg-signal-offered-bg text-signal-offered",
  Rejected: "bg-signal-rejected-bg text-signal-rejected",
};

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${STYLES[status]}`}>
      {status}
    </span>
  );
}
