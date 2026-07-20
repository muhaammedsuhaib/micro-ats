import { useMemo, useRef } from "react";
import { Interviewer, InterviewSlot } from "../types";
import { GRID_START_HOUR, GRID_END_HOUR, SLOT_MINUTES } from "../constants";
import { formatLocalTime, isSameLocalDay, minutesSinceLocalMidnight } from "../utils/timezone";
import { Plus, X } from "lucide-react";

const ROW_HEIGHT = 26; // px per 30-minute row
const GRID_TOP_MINUTES = GRID_START_HOUR * 60;
const GRID_TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

interface Props {
  interviewers: Interviewer[];
  slots: InterviewSlot[];
  selectedDate: Date;
  onSlotClick: (slot: InterviewSlot) => void;
  onEmptyCellClick: (interviewer: Interviewer, startLocalMinutes: number) => void;
}

function minutesToLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function CalendarGrid({ interviewers, slots, selectedDate, onSlotClick, onEmptyCellClick }: Props) {
  const rows = useMemo(() => {
    const count = GRID_TOTAL_MINUTES / SLOT_MINUTES;
    return Array.from({ length: count }, (_, i) => GRID_TOP_MINUTES + i * SLOT_MINUTES);
  }, []);

  const gridHeight = (GRID_TOTAL_MINUTES / SLOT_MINUTES) * ROW_HEIGHT;
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const slotsByInterviewer = useMemo(() => {
    const map = new Map<string, InterviewSlot[]>();
    for (const iv of interviewers) map.set(iv._id, []);
    for (const slot of slots) {
      if (slot.status === "Cancelled") continue;
      if (!isSameLocalDay(slot.startTime, selectedDate)) continue;
      const list = map.get(slot.interviewer._id);
      if (list) list.push(slot);
    }
    return map;
  }, [interviewers, slots, selectedDate]);

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>, interviewer: Interviewer) {
    const col = columnRefs.current[interviewer._id];
    if (!col) return;
    const rect = col.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const rawMinutes = GRID_TOP_MINUTES + (offsetY / ROW_HEIGHT) * SLOT_MINUTES;
    const snapped = Math.round(rawMinutes / SLOT_MINUTES) * SLOT_MINUTES;
    const clamped = Math.min(Math.max(snapped, GRID_TOP_MINUTES), GRID_TOP_MINUTES + GRID_TOTAL_MINUTES - SLOT_MINUTES);
    onEmptyCellClick(interviewer, clamped);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-panel">
      <div
        className="grid min-w-[720px]"
        style={{ gridTemplateColumns: `72px repeat(${interviewers.length}, minmax(180px, 1fr))` }}
      >
        {/* Header row */}
        <div className="sticky top-0 z-10 border-b border-r border-ink-100 bg-white" />
        {interviewers.map((iv) => (
          <div
            key={iv._id}
            className="sticky top-0 z-10 flex items-center gap-2 border-b border-l border-ink-100 bg-white px-3 py-3"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: iv.colorTag }} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{iv.name}</p>
              <p className="truncate text-[11px] text-ink-400">{iv.expertise.join(" · ") || "Interviewer"}</p>
            </div>
          </div>
        ))}

        {/* Time labels column */}
        <div className="relative border-r border-ink-100" style={{ height: gridHeight }}>
          {rows.map((min) =>
            min % 60 === 0 ? (
              <div
                key={min}
                className="absolute left-0 right-0 -translate-y-1/2 pr-2 text-right text-[11px] font-medium text-ink-400"
                style={{ top: ((min - GRID_TOP_MINUTES) / SLOT_MINUTES) * ROW_HEIGHT }}
              >
                {minutesToLabel(min)}
              </div>
            ) : null
          )}
        </div>

        {/* Interviewer columns */}
        {interviewers.map((iv) => (
          <div
            key={iv._id}
            ref={(el) => (columnRefs.current[iv._id] = el)}
            onClick={(e) => handleColumnClick(e, iv)}
            className="group relative cursor-cell border-l border-ink-100"
            style={{ height: gridHeight }}
          >
            {/* Hour gridlines */}
            {rows.map((min) => (
              <div
                key={min}
                className={`absolute left-0 right-0 border-t ${min % 60 === 0 ? "border-ink-100" : "border-ink-50"}`}
                style={{ top: ((min - GRID_TOP_MINUTES) / SLOT_MINUTES) * ROW_HEIGHT }}
              />
            ))}

            {/* Hover affordance per empty row */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex items-center gap-1 rounded-full bg-ink-900/0 text-ink-300">
                <Plus size={14} />
              </span>
            </div>

            {/* Booked slots */}
            {(slotsByInterviewer.get(iv._id) ?? []).map((slot) => {
              const startMin = minutesSinceLocalMidnight(slot.startTime);
              const endMin = minutesSinceLocalMidnight(slot.endTime);
              const top = ((startMin - GRID_TOP_MINUTES) / SLOT_MINUTES) * ROW_HEIGHT;
              const height = Math.max(((endMin - startMin) / SLOT_MINUTES) * ROW_HEIGHT, ROW_HEIGHT - 4);

              return (
                <button
                  key={slot._id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick(slot);
                  }}
                  className="absolute left-1 right-1 overflow-hidden rounded-md border px-2 py-1 text-left shadow-sm transition-transform hover:z-20 hover:scale-[1.02]"
                  style={{
                    top,
                    height,
                    backgroundColor: `${iv.colorTag}1A`,
                    borderColor: `${iv.colorTag}55`,
                  }}
                >
                  <p className="truncate text-[11.5px] font-semibold" style={{ color: iv.colorTag }}>
                    {slot.candidate.name}
                  </p>
                  <p className="truncate text-[10.5px] text-ink-500">
                    {formatLocalTime(slot.startTime)} – {formatLocalTime(slot.endTime)}
                  </p>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {interviewers.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <X className="text-ink-300" size={22} />
          <p className="text-sm font-medium text-ink-500">No interviewers yet — add one to start scheduling.</p>
        </div>
      )}
    </div>
  );
}
