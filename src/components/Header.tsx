import { ChevronLeft, ChevronRight, Globe2, CalendarDays } from "lucide-react";
import { formatLocalDateLabel, localTimeZone, toDateInputValue, addDays } from "../utils/timezone";

interface Props {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
}

export function Header({ selectedDate, onChangeDate }: Props) {
  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-white">
            <CalendarDays size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-none text-ink-900">Micro-ATS</h1>
            <p className="mt-1 text-xs font-medium text-ink-400">Smart Interview Scheduler</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-1.5 py-1.5">
          <button
            type="button"
            onClick={() => onChangeDate(addDays(selectedDate, -1))}
            className="rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-900"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2 px-2">
            <span className="font-display text-sm font-semibold text-ink-900">{formatLocalDateLabel(selectedDate)}</span>
            <input
              type="date"
              value={toDateInputValue(selectedDate)}
              onChange={(e) => e.target.value && onChangeDate(new Date(`${e.target.value}T00:00:00`))}
              className="w-0 opacity-0"
              aria-label="Jump to date"
            />
          </div>
          <button
            type="button"
            onClick={() => onChangeDate(addDays(selectedDate, 1))}
            className="rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-900"
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => onChangeDate(new Date())}
            className="ml-1 rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-600 hover:border-accent-400 hover:text-accent-600"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-medium text-ink-100">
          <Globe2 size={13} />
          <span>
            Times shown in your zone · <span className="font-mono text-[11px]">{localTimeZone}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
