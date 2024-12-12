// Define the structure for an individual event
export interface Event {
  id: string;
  title: string;
  startTime: string; // ISO string format
  endTime: string; // ISO string format
  description?: string;
  category: 'work' | 'personal' | 'other' | 'education' | 'hobbies' | 'health' | 'finance';
}

// Define the structure for events grouped by date
export interface DayEvents {
  [date: string]: Event[]; // Key is the date string, value is an array of events
}

