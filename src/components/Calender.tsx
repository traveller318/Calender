import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import FilterEvents from './FilterEvents'
import SideDrawer from './SideDrawer'
import { Event, DayEvents } from '../utils/types'
import { getEventsForMonth, saveEvent, deleteEvent, updateEvent } from '../utils/eventStorage'
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils'
import { exportEvents, downloadFile } from '../utils/exportEvents'

const eventColors = {
  work: 'bg-blue-500 text-white',
  personal: 'bg-green-500 text-white',
  other: 'bg-gray-500 text-white',
  education: 'bg-yellow-500 text-black',
  hobbies: 'bg-purple-500 text-white',
  health: 'bg-red-500 text-white',
  finance: 'bg-yellow-400 text-black',
}

const checkTimeOverlap = (start1: number, end1: number, start2: number, end2: number): boolean => {
  return start1 < end2 && end1 > start2;
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<DayEvents>({})
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const monthEvents = getEventsForMonth(currentDate)
    const groupedEvents: DayEvents = {}
    monthEvents.forEach(event => {
      const date = new Date(event.startTime).toDateString()
      if (!groupedEvents[date]) {
        groupedEvents[date] = []
      }
      groupedEvents[date].push(event)
    })
    setEvents(groupedEvents)
    setFilteredEvents(monthEvents)
  }, [currentDate])

  useEffect(() => {
    const lowercasedFilter = filter.toLowerCase()
    const filtered = Object.values(events).flat().filter(event =>
      event.title.toLowerCase().includes(lowercasedFilter) ||
      event.description?.toLowerCase().includes(lowercasedFilter)
    )
    setFilteredEvents(filtered)
  }, [filter, events])

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setIsSideDrawerOpen(true)
  }

  const checkEventOverlap = (event1: Event, event2: Event): boolean => {
    const start1 = new Date(event1.startTime);
    const end1 = new Date(event1.endTime);
    const start2 = new Date(event2.startTime);
    const end2 = new Date(event2.endTime);

    // Convert all times to minutes since midnight
    const start1Minutes = (start1.getHours() * 60) + start1.getMinutes();
    const end1Minutes = (end1.getHours() * 60) + end1.getMinutes();
    const start2Minutes = (start2.getHours() * 60) + start2.getMinutes();
    const end2Minutes = (end2.getHours() * 60) + end2.getMinutes();

    // Use the checkTimeOverlap utility function
    return checkTimeOverlap(
      start1Minutes,
      end1Minutes,
      start2Minutes,
      end2Minutes
    );
  };

  const handleSaveEvent = (event: Event) => {
    const updatedEvents = { ...events };
    const eventDate = new Date(event.startTime).toDateString();
    if (!updatedEvents[eventDate]) {
      updatedEvents[eventDate] = [];
    }

    const existingEventIndex = updatedEvents[eventDate].findIndex(e => e.id === event.id);
    
    // Check for duplicate event names
    const isDuplicateName = updatedEvents[eventDate].some(e => 
      e.title.toLowerCase() === event.title.toLowerCase() && 
      (!event.id || e.id !== event.id)
    );

    if (isDuplicateName) {
      alert('An event with this name already exists on this day. Please choose a different name.');
      return;
    }

    // Check for overlapping events, excluding the event being edited
    const hasOverlap = updatedEvents[eventDate].some((e) => {
      if (existingEventIndex !== -1 && e.id === event.id) return false;
      return checkEventOverlap(event, e);
    });

    if (hasOverlap) {
      alert('This event overlaps with an existing event. Please choose a different time.');
      return;
    }

    if (existingEventIndex !== -1) {
      updatedEvents[eventDate][existingEventIndex] = event;
      updateEvent(event.id, event);
    } else {
      updatedEvents[eventDate].push(event);
      saveEvent(event);
    }

    setEvents(updatedEvents);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = { ...events }
    Object.keys(updatedEvents).forEach(date => {
      updatedEvents[date] = updatedEvents[date].filter(event => event.id !== eventId)
      if (updatedEvents[date].length === 0) {
        delete updatedEvents[date]
      }
    })
    setEvents(updatedEvents)
    deleteEvent(eventId)
  }

  const handleFilteredEventClick = (event: Event) => {
    setSelectedDate(new Date(event.startTime))
    setIsSideDrawerOpen(true)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceDate = result.source.droppableId;
    const destinationDate = result.destination.droppableId;
    const eventIndex = result.source.index;

    const updatedEvents = { ...events };
    const [movedEvent] = updatedEvents[sourceDate].splice(eventIndex, 1);

    // Create new dates while preserving the time
    const oldStartDate = new Date(movedEvent.startTime);
    const oldEndDate = new Date(movedEvent.endTime);
    const newStartDate = new Date(destinationDate);
    const newEndDate = new Date(destinationDate);

    // Set hours and minutes from the original event
    newStartDate.setHours(oldStartDate.getHours(), oldStartDate.getMinutes());
    newEndDate.setHours(oldEndDate.getHours(), oldEndDate.getMinutes());

    // If end time is before start time, it means it ends the next day
    if (oldEndDate.getTime() < oldStartDate.getTime()) {
      newEndDate.setDate(newEndDate.getDate() + 1);
    }

    const updatedEvent = {
      ...movedEvent,
      startTime: newStartDate.toISOString(),
      endTime: newEndDate.toISOString(),
    };

    // Check for overlapping events in the destination date
    const hasOverlap = updatedEvents[destinationDate]?.some(existingEvent => 
      checkEventOverlap(updatedEvent, existingEvent)
    );

    if (hasOverlap) {
      alert('This event overlaps with an existing event in the destination date. The event will not be moved.');
      updatedEvents[sourceDate].splice(eventIndex, 0, movedEvent);
    } else {
      if (!updatedEvents[destinationDate]) {
        updatedEvents[destinationDate] = [];
      }
      updatedEvents[destinationDate].push(updatedEvent);
      updateEvent(updatedEvent.id, updatedEvent);
    }

    setEvents(updatedEvents);
  };
  


  const handleExport = (format: 'json' | 'csv') => {
    const allEvents = Object.values(events).flat()
    const exportedContent = exportEvents(allEvents, format)
    const fileName = `events_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.${format}`
    const contentType = format === 'json' ? 'application/json' : 'text/csv'
    downloadFile(exportedContent, fileName, contentType)
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center space-x-4">
          <Button onClick={handlePrevMonth} variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button onClick={handleNextMonth} variant="outline" size="icon" className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <FilterEvents
          setFilter={setFilter}
          filteredEvents={filteredEvents}
          onEventClick={handleFilteredEventClick}
        />
        <div className="flex space-x-2">
          <Button onClick={() => handleExport('json')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`text-center font-semibold p-2 ${
              day === 'Sun' || day === 'Sat' ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateString = date.toDateString()
            const isToday = date.toDateString() === new Date().toDateString()
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            const dayEvents = events[dateString] || []

            return (
              <Droppable droppableId={dateString} key={dateString}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`h-32 overflow-y-auto rounded-lg p-2 transition-all duration-200 ease-in-out ${
                      isToday ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : 
                      isSelected ? 'bg-green-100 dark:bg-green-900 ring-2 ring-green-500' :
                      isWeekend ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                    } border border-gray-200 dark:border-gray-600 ${
                      snapshot.isDraggingOver ? 'bg-yellow-100 dark:bg-yellow-900' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday ? 'text-blue-600 dark:text-blue-300' : 
                      isSelected ? 'text-green-600 dark:text-green-300' :
                      isWeekend ? 'text-red-500' : ''
                    }`}>{day}</div>
                    {dayEvents.map((event, index) => (
                      <Draggable key={event.id} draggableId={event.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`text-xs truncate rounded px-1 py-0.5 mb-1 ${eventColors[event.category]} ${
                              snapshot.isDragging ? 'ring-2 ring-yellow-500 opacity-70' : ''
                            }`}
                          >
                            {event.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>
      <SideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        selectedDate={selectedDate}
        events={selectedDate ? events[selectedDate.toDateString()] || [] : []}
        onAddEvent={() => {}}
        onEditEvent={() => {}}
        onDeleteEvent={handleDeleteEvent}
        onSaveEvent={handleSaveEvent}
        existingEvents={selectedDate ? events[selectedDate.toDateString()] || [] : []}
      />
    </div>
  )
}

export default Calendar