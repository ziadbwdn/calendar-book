export interface WorkingHour {
  day: number; // 1=Monday, 7=Sunday
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface OrganizerSettings {
  id: string;
  timezone: string;
  workingHours: WorkingHour[];
  meetingDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  minimumNotice: number;
  blackoutDates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  timezone: string;
  workingHours: WorkingHour[];
  meetingDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  minimumNotice: number;
  blackoutDates: string[];
}
