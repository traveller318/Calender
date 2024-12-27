// Convert 12-hour time to 24-hour format for comparison
export const convertTo24Hour = (time: string, period: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  let hour = hours;
  
  // Handle special cases for 12 AM/PM
  if (period === 'AM' && hours === 12) {
    hour = 0;
  } else if (period === 'PM' && hours !== 12) {
    hour = hours + 12;
  }
  
  return (hour * 60) + minutes; // Return minutes since midnight
};

// Get the number of days in a given month
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Get the day of the week for the first day of a given month (0-6, where 0 is Sunday)
export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

// Check if two time ranges overlap
export const checkTimeOverlap = (
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean => {
  // Handle cases where end time is on the next day (smaller than start time)
  if (end1 < start1) end1 += 24 * 60; // Add 24 hours in minutes
  if (end2 < start2) end2 += 24 * 60;

  return start1 < end2 && end1 > start2;
};

// Format time for display
export const formatTimeForDisplay = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
};

// Convert a Date object to a string format suitable for input fields
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Parse a date string in the format "YYYY-MM-DD" and return a Date object
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Check if a date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// Get the week number for a given date
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
};

// Check if two dates are on the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

