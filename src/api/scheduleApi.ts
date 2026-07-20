import axios from "axios";
import { apiClient } from "./client";
import { Candidate, CandidateStatus, Interviewer, InterviewSlot } from "../types";

export interface CreateCandidateInput {
  name: string;
  email: string;
  positionAppliedFor: string;
}

export async function createCandidate(input: CreateCandidateInput): Promise<Candidate> {
  const { data } = await apiClient.post<{ data: Candidate }>("/candidates", input);
  return data.data;
}

export interface CreateInterviewerInput {
  name: string;
  email: string;
  expertise?: string[];
  colorTag?: string;
}

export async function createInterviewer(input: CreateInterviewerInput): Promise<Interviewer> {
  const { data } = await apiClient.post<{ data: Interviewer }>("/interviewers", input);
  return data.data;
}

export async function fetchInterviewers(): Promise<Interviewer[]> {
  const { data } = await apiClient.get<{ data: Interviewer[] }>("/interviewers");
  return data.data;
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const { data } = await apiClient.get<{ data: Candidate[] }>("/candidates");
  return data.data;
}

export async function fetchSchedule(params: { from?: string; to?: string } = {}): Promise<InterviewSlot[]> {
  const { data } = await apiClient.get<{ data: InterviewSlot[] }>("/schedule", { params });
  return data.data;
}

export async function updateCandidateStatus(candidateId: string, status: CandidateStatus): Promise<Candidate> {
  const { data } = await apiClient.patch<{ data: Candidate }>(`/candidates/${candidateId}/status`, { status });
  return data.data;
}

export async function cancelSlot(slotId: string): Promise<InterviewSlot> {
  const { data } = await apiClient.patch<{ data: InterviewSlot }>(`/schedule/${slotId}/cancel`);
  return data.data;
}

export interface CreateScheduleInput {
  candidateId: string;
  interviewerId: string;
  startTime: string; // ISO UTC
  endTime: string; // ISO UTC
  notes?: string;
}

// Raised by createSchedule specifically on a 409, carrying the structured
// conflict payload so the UI can show exactly who the clash is with.
export class ScheduleConflictError extends Error {
  conflictingCandidateName: string;
  conflictingSlot: { id: string; startTime: string; endTime: string };

  constructor(message: string, conflictingCandidateName: string, conflictingSlot: { id: string; startTime: string; endTime: string }) {
    super(message);
    this.name = "ScheduleConflictError";
    this.conflictingCandidateName = conflictingCandidateName;
    this.conflictingSlot = conflictingSlot;
  }
}

export async function createSchedule(input: CreateScheduleInput): Promise<InterviewSlot> {
  try {
    const { data } = await apiClient.post<{ data: InterviewSlot }>("/schedule", input);
    return data.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      const body = err.response.data as {
        message: string;
        conflictingCandidateName: string;
        conflictingSlot: { id: string; startTime: string; endTime: string };
      };
      throw new ScheduleConflictError(body.message, body.conflictingCandidateName, body.conflictingSlot);
    }
    throw err;
  }
}
