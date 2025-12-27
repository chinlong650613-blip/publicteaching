
export type EngagementLevel = 'high' | 'medium' | 'low';

export interface TeachingMode {
  id: string;
  name: string;
  active: boolean;
  totalSeconds: number;
}

export interface TeachingAction {
  id: string;
  name: string;
  count: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'mode' | 'action' | 'note' | 'engagement';
  label: string;
  value?: string | number;
}

export interface SessionState {
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  subject: string;
}
