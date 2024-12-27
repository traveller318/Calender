import { Event } from '../utils/types';

// Key used for storing events in localStorage
const STORAGE_KEY = 'calendar_events';

// Helper function to normalize time to 24-hour format
const normalizeTime = (dateStr: string): Date => {
  const date = new Date(dateStr);
  return date;
}



// Retrieve events for a specific month from localStorage
export const getEventsForMonth = (date: Date): Event[] => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

  return events.filter(event => {
    const eventStart = normalizeTime(event.startTime);
    return eventStart >= startOfMonth && eventStart <= endOfMonth;
  }).map(event => ({
    ...event,
    startTime: normalizeTime(event.startTime).toISOString(),
    endTime: normalizeTime(event.endTime).toISOString()
  }));
}

// Retrieve events for a specific day from localStorage
export const getEventsForDay = (date: Date): Event[] => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  
  // Set the time to start and end of day to ensure we catch all events
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  return events.filter(event => {
    const eventStart = normalizeTime(event.startTime);
    return eventStart >= startOfDay && eventStart <= endOfDay;
  }).map(event => ({
    ...event,
    startTime: normalizeTime(event.startTime).toISOString(),
    endTime: normalizeTime(event.endTime).toISOString()
  }));
}

// Save a new event to localStorage with normalized times
export const saveEvent = (event: Event): void => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  
  // Normalize the times before saving
  const normalizedEvent = {
    ...event,
    startTime: normalizeTime(event.startTime).toISOString(),
    endTime: normalizeTime(event.endTime).toISOString()
  };

  events.push(normalizedEvent);
  
  // Sort events by start time for consistent retrieval
  events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// Update an existing event in localStorage
export const updateEvent = (eventId: string, updatedEvent: Event): void => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  const index = events.findIndex(e => e.id === eventId);
  
  if (index !== -1) {
    // Normalize the times before updating
    const normalizedEvent = {
      ...updatedEvent,
      startTime: normalizeTime(updatedEvent.startTime).toISOString(),
      endTime: normalizeTime(updatedEvent.endTime).toISOString()
    };

    events[index] = normalizedEvent;
    
    // Sort events by start time for consistent retrieval
    events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
}

// Delete an event from localStorage
export const deleteEvent = (eventId: string): void => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  const updatedEvents = events.filter(e => e.id !== eventId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
}

// Helper function to get formatted time string (12-hour format with AM/PM)
export const getFormattedTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Helper function to convert 12-hour time to 24-hour time
export const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  let hoursNumber = parseInt(hours, 10);
  if (modifier === 'PM' && hoursNumber < 12) hoursNumber += 12;
  if (modifier === 'AM' && hoursNumber === 12) hoursNumber = 0;
  
  return `${hoursNumber.toString().padStart(2, '0')}:${minutes}`;
}