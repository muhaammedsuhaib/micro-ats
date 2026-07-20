export type CandidateStatus = "Applied" | "Technical Round" | "Offered" | "Rejected";

export interface Interviewer {
  _id: string;
  name: string;
  email: string;
  expertise: string[];
  colorTag: string;
}

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  positionAppliedFor: string;
  status: CandidateStatus;
  interviewSlots: string[];
}

export interface InterviewSlot {
  _id: string;
  candidate: Candidate;
  interviewer: Interviewer;
  startTime: string; // ISO UTC
  endTime: string; // ISO UTC
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

export interface ConflictError {
  error: "Conflict";
  message: string;
  conflictingCandidateName: string;
  conflictingSlot: { id: string; startTime: string; endTime: string };
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[] | undefined>;
}
