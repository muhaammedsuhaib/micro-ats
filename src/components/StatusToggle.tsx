import { CandidateStatus } from "../types";
import { CANDIDATE_STATUS_FLOW } from "../constants";

interface Props {
  status: CandidateStatus;
  onChange: (status: CandidateStatus) => void;
  disabled?: boolean;
}

/**
 * Renders every pipeline stage as a segmented control so a recruiter can
 * jump directly to a stage, not just step forward — candidates get
 * rejected from any stage, not only in sequence.
 */
export function StatusToggle({ status, onChange, disabled }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5 text-xs font-medium">
      {CANDIDATE_STATUS_FLOW.map((stage) => {
        const active = stage === status;
        return (
          <button
            key={stage}
            type="button"
            disabled={disabled}
            onClick={() => onChange(stage)}
            className={`rounded-md px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active ? "bg-accent-500 text-white shadow-sm" : "text-ink-500 hover:bg-ink-50"
            }`}
            aria-pressed={active}
          >
            {stage}
          </button>
        );
      })}
    </div>
  );
}
