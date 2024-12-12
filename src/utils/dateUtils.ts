// Get the number of days in a given month
export const getDaysInMonth = (date: Date): number => {
  // Create a new date for the next month's 0th day (last day of current month)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// Get the day of the week for the first day of a given month (0-6, where 0 is Sunday)
export const getFirstDayOfMonth = (date: Date): number => {
  // Create a new date for the first day of the month and get its day of the week
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}
