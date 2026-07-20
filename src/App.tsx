import { useState } from "react";
import { Header } from "./components/Header";
import { CalendarGrid } from "./components/CalendarGrid";
import { CandidatePanel } from "./components/CandidatePanel";
import { ScheduleModal } from "./components/ScheduleModal";
import { AddCandidateModal } from "./components/AddCandidateModal";
import { AddInterviewerModal } from "./components/AddInterviewerModal";
import { useSchedule } from "./hooks/useSchedule";
import { Interviewer, InterviewSlot } from "./types";
import { AlertCircle, Loader2, Plus, UserCog } from "lucide-react";

type ModalState =
  | { kind: "closed" }
  | { kind: "create"; interviewer: Interviewer; startMinutes: number }
  | { kind: "view"; slot: InterviewSlot }
  | { kind: "addCandidate" }
  | { kind: "addInterviewer" };

export default function App() {
  const { interviewers, candidates, slots, loading, error, book, cancel, setStatus, addCandidate, addInterviewer } =
    useSchedule();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  return (
    <div className="min-h-screen bg-ink-50">
      <Header selectedDate={selectedDate} onChangeDate={setSelectedDate} />

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-900">Interview calendar</h2>
            <p className="text-sm text-ink-400">Click an empty slot on any interviewer's column to book an interview.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModal({ kind: "addInterviewer" })}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-600 hover:border-accent-400 hover:text-accent-600"
            >
              <UserCog size={15} />
              New interviewer
            </button>
            <button
              type="button"
              onClick={() =>
                interviewers[0] && setModal({ kind: "create", interviewer: interviewers[0], startMinutes: 9 * 60 })
              }
              disabled={interviewers.length === 0 || candidates.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
            >
              <Plus size={15} />
              New interview
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-signal-rejected-bg bg-signal-rejected-bg px-4 py-3 text-sm font-medium text-signal-rejected">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-ink-100 bg-white py-24 text-ink-400 shadow-panel">
            <Loader2 size={18} className="animate-spin" />
            Loading dashboard…
          </div>
        ) : (
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="min-w-0 flex-1">
              <CalendarGrid
                interviewers={interviewers}
                slots={slots}
                selectedDate={selectedDate}
                onSlotClick={(slot) => setModal({ kind: "view", slot })}
                onEmptyCellClick={(interviewer, startMinutes) => setModal({ kind: "create", interviewer, startMinutes })}
              />
            </div>
            <CandidatePanel
              candidates={candidates}
              onSetStatus={(id, status) => setStatus(id, status)}
              onAddCandidate={() => setModal({ kind: "addCandidate" })}
            />
          </div>
        )}
      </main>

      {modal.kind === "create" && (
        <ScheduleModal
          mode="create"
          interviewers={interviewers}
          candidates={candidates}
          selectedDate={selectedDate}
          initialInterviewerId={modal.interviewer._id}
          initialStartMinutes={modal.startMinutes}
          onClose={() => setModal({ kind: "closed" })}
          onCreate={book}
        />
      )}

      {modal.kind === "view" && (
        <ScheduleModal
          mode="view"
          slot={modal.slot}
          onClose={() => setModal({ kind: "closed" })}
          onCancelSlot={cancel}
          onSetStatus={setStatus}
        />
      )}

      {modal.kind === "addCandidate" && (
        <AddCandidateModal onClose={() => setModal({ kind: "closed" })} onCreate={addCandidate} />
      )}

      {modal.kind === "addInterviewer" && (
        <AddInterviewerModal onClose={() => setModal({ kind: "closed" })} onCreate={addInterviewer} />
      )}
    </div>
  );
}
