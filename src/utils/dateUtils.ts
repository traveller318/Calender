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

