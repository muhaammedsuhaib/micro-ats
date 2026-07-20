import { useCallback, useEffect, useState } from "react";
import { Candidate, Interviewer, InterviewSlot } from "../types";
import {
  fetchCandidates,
  fetchInterviewers,
  fetchSchedule,
  createSchedule,
  CreateScheduleInput,
  cancelSlot as cancelSlotApi,
  updateCandidateStatus as updateCandidateStatusApi,
  createCandidate as createCandidateApi,
  CreateCandidateInput,
  createInterviewer as createInterviewerApi,
  CreateInterviewerInput,
  ScheduleConflictError,
} from "../api/scheduleApi";
import { CandidateStatus } from "../types";

export function useSchedule() {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [iv, cd, sl] = await Promise.all([fetchInterviewers(), fetchCandidates(), fetchSchedule()]);
      setInterviewers(iv);
      setCandidates(cd);
      setSlots(sl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const book = useCallback(async (input: CreateScheduleInput) => {
    const slot = await createSchedule(input); // throws ScheduleConflictError on 409
    setSlots((prev) => [...prev, slot]);
    setCandidates((prev) =>
      prev.map((c) => (c._id === slot.candidate._id ? { ...c, status: slot.candidate.status } : c))
    );
    return slot;
  }, []);

  const cancel = useCallback(async (slotId: string) => {
    const updated = await cancelSlotApi(slotId);
    setSlots((prev) => prev.map((s) => (s._id === slotId ? { ...s, status: updated.status } : s)));
  }, []);

  const setStatus = useCallback(async (candidateId: string, status: CandidateStatus) => {
    const updated = await updateCandidateStatusApi(candidateId, status);
    setCandidates((prev) => prev.map((c) => (c._id === candidateId ? updated : c)));
  }, []);

  const addCandidate = useCallback(async (input: CreateCandidateInput) => {
    const candidate = await createCandidateApi(input);
    setCandidates((prev) => [candidate, ...prev]);
    return candidate;
  }, []);

  const addInterviewer = useCallback(async (input: CreateInterviewerInput) => {
    const interviewer = await createInterviewerApi(input);
    setInterviewers((prev) => [...prev, interviewer].sort((a, b) => a.name.localeCompare(b.name)));
    return interviewer;
  }, []);

  return {
    interviewers,
    candidates,
    slots,
    loading,
    error,
    reload: loadAll,
    book,
    cancel,
    setStatus,
    addCandidate,
    addInterviewer,
  };
}

export { ScheduleConflictError };
