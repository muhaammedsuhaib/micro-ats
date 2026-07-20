import { Candidate, CandidateStatus } from "../types";
import { StatusBadge } from "./StatusBadge";
import { Users, UserPlus } from "lucide-react";

interface Props {
  candidates: Candidate[];
  onSetStatus: (candidateId: string, status: CandidateStatus) => void;
  onAddCandidate: () => void;
}

export function CandidatePanel({ candidates, onSetStatus, onAddCandidate }: Props) {
  return (
    <aside className="w-full shrink-0 rounded-xl border border-ink-100 bg-white shadow-panel lg:w-[300px]">
      <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3.5">
        <Users size={15} className="text-ink-400" />
        <h2 className="font-display text-sm font-semibold text-ink-900">Candidate pipeline</h2>
        <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-500">
          {candidates.length}
        </span>
        <button
          type="button"
          onClick={onAddCandidate}
          className="ml-auto flex items-center gap-1 rounded-md border border-ink-200 px-2 py-1 text-[11px] font-semibold text-ink-500 hover:border-accent-400 hover:text-accent-600"
        >
          <UserPlus size={12} />
          Add
        </button>
      </div>
      <ul className="max-h-[560px] scrollbar-thin divide-y divide-ink-50 overflow-y-auto">
        {candidates.map((c) => (
          <li key={c._id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{c.name}</p>
                <p className="truncate text-[11px] text-ink-400">{c.positionAppliedFor}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(["Applied", "Technical Round", "Offered", "Rejected"] as CandidateStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onSetStatus(c._id, s)}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                    c.status === s ? "bg-accent-500 text-white" : "bg-ink-50 text-ink-400 hover:bg-ink-100"
                  }`}
                >
                  {s === "Technical Round" ? "Tech" : s}
                </button>
              ))}
            </div>
          </li>
        ))}
        {candidates.length === 0 && <li className="px-4 py-6 text-center text-xs text-ink-400">No candidates yet.</li>}
      </ul>
    </aside>
  );
}
