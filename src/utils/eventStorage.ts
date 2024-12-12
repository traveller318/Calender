import { Event } from '../utils/types';

// Key used for storing events in localStorage
const STORAGE_KEY = 'calendar_events';

// Retrieve events for a specific month from localStorage
export const getEventsForMonth = (date: Date): Event[] => {
  // Parse stored events from localStorage
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  
  // Calculate start and end of the month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  // Filter events that fall within the specified month
  return events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= startOfMonth && eventDate <= endOfMonth;
  });
}

// Retrieve events for a specific day from localStorage
export const getEventsForDay = (date: Date): Event[] => {
  // Parse stored events from localStorage
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  
  // Calculate start and end of the day
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  // Filter events that fall within the specified day
  return events.filter(event => {
    const eventStart = new Date(event.startTime);
    return eventStart >= startOfDay && eventStart <= endOfDay;
  });
}

// Save a new event to localStorage
export const saveEvent = (event: Event): void => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  events.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// Update an existing event in localStorage
export const updateEvent = (eventId: string, updatedEvent: Event): void => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = updatedEvent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
}

// Delete an event from localStorage
export const deleteEvent = (eventId: string): void => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Event[];
  const updatedEvents = events.filter(e => e.id !== eventId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
}

