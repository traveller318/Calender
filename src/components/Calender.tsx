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

  const convertTo24Hour = (date: Date): number => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes; // Convert to minutes since midnight
  };
  
  const checkOverlap = (event1Start: Date, event1End: Date, event2Start: Date, event2End: Date) => {
    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
  
    // Convert all times to minutes since midnight for comparison
    const start1 = convertTo24Hour(event1Start);
    const end1 = convertTo24Hour(event1End);
    const start2 = convertTo24Hour(event2Start);
    const end2 = convertTo24Hour(event2End);
  
    // Check if events overlap using minute-based comparison
    if (start1 < end2 && end1 > start2) {
      const message = `Event overlaps with existing event from ${formatTime(event2Start)} to ${formatTime(event2End)}`;
      alert(message);
      return true;
    }
    
    return false;
  };

  const handleSaveEvent = (event: Event) => {
    const updatedEvents = { ...events }
    const eventDate = new Date(event.startTime).toDateString()
    if (!updatedEvents[eventDate]) {
      updatedEvents[eventDate] = []
    }

    const newStart = new Date(event.startTime)
    const newEnd = new Date(event.endTime)
    const existingEventIndex = updatedEvents[eventDate].findIndex(e => e.id === event.id)

    if (existingEventIndex !== -1) {
      const hasOverlap = updatedEvents[eventDate].some((e, index) => {
        if (index === existingEventIndex) return false;
        const eStart = new Date(e.startTime)
        const eEnd = new Date(e.endTime)
        return checkOverlap(newStart, newEnd, eStart, eEnd)
      });

      if (hasOverlap) return;
      updatedEvents[eventDate][existingEventIndex] = event
      updateEvent(event.id, event)
    } else {
      const hasOverlap = updatedEvents[eventDate].some(e => {
        const eStart = new Date(e.startTime)
        const eEnd = new Date(e.endTime)
        return checkOverlap(newStart, newEnd, eStart, eEnd)
      });

      if (hasOverlap) return;
      updatedEvents[eventDate].push(event)
      saveEvent(event)
    }
    setEvents(updatedEvents)
  }

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
    if (!result.destination) return

    const sourceDate = result.source.droppableId
    const destinationDate = result.destination.droppableId
    const eventIndex = result.source.index

    const updatedEvents = { ...events }
    const [movedEvent] = updatedEvents[sourceDate].splice(eventIndex, 1)

    const newStartDate = new Date(destinationDate)
    const oldStartDate = new Date(movedEvent.startTime)
    const timeDiff = newStartDate.getTime() - oldStartDate.getTime()

    const newStart = new Date(oldStartDate.getTime() + timeDiff)
    const newEnd = new Date(new Date(movedEvent.endTime).getTime() + timeDiff)

    const hasOverlap = updatedEvents[destinationDate]?.some(e => {
      const eStart = new Date(e.startTime)
      const eEnd = new Date(e.endTime)
      return checkOverlap(newStart, newEnd, eStart, eEnd)
    });

    if (hasOverlap) {
      updatedEvents[sourceDate].splice(eventIndex, 0, movedEvent)
    } else {
      movedEvent.startTime = newStart.toISOString()
      movedEvent.endTime = newEnd.toISOString()

      if (!updatedEvents[destinationDate]) {
        updatedEvents[destinationDate] = []
      }
      updatedEvents[destinationDate].push(movedEvent)
      updateEvent(movedEvent.id, movedEvent)
    }

    setEvents(updatedEvents)
  }


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
      />
    </div>
  )
}

export default Calendar

