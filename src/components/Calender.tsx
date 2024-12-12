import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import FilterEvents from './FilterEvents'
import SideDrawer from './SideDrawer'
import { Event, DayEvents } from '../utils/types'
import { getEventsForMonth, saveEvent, deleteEvent, updateEvent } from '../utils/eventStorage'
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils'

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

  const handleSaveEvent = (event: Event) => {
    const updatedEvents = { ...events }
    const eventDate = new Date(event.startTime).toDateString()
    if (!updatedEvents[eventDate]) {
      updatedEvents[eventDate] = []
    }
    const existingEventIndex = updatedEvents[eventDate].findIndex(e => e.id === event.id)
    if (existingEventIndex !== -1) {
      // Check for overlapping events when updating
      const isOverlapping = updatedEvents[eventDate].some((e, index) => {
        if (index === existingEventIndex) return false; // Skip the event being updated
        const eStart = new Date(e.startTime).getTime()
        const eEnd = new Date(e.endTime).getTime()
        const newStart = new Date(event.startTime).getTime()
        const newEnd = new Date(event.endTime).getTime()
        return (newStart < eEnd && newEnd > eStart)
      })

      if (isOverlapping) {
        alert('This event overlaps with an existing event. Please choose a different time.')
        return
      }
      updatedEvents[eventDate][existingEventIndex] = event
      updateEvent(event.id, event)
    } else {
      // Check for overlapping events when adding new event
      const isOverlapping = updatedEvents[eventDate].some(e => {
        const eStart = new Date(e.startTime).getTime()
        const eEnd = new Date(e.endTime).getTime()
        const newStart = new Date(event.startTime).getTime()
        const newEnd = new Date(event.endTime).getTime()
        return (newStart < eEnd && newEnd > eStart)
      })

      if (isOverlapping) {
        alert('This event overlaps with an existing event. Please choose a different time.')
        return
      }
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

    // Update the event's date
    const newStartDate = new Date(destinationDate)
    const oldStartDate = new Date(movedEvent.startTime)
    const timeDiff = newStartDate.getTime() - oldStartDate.getTime()

    const newStart = new Date(oldStartDate.getTime() + timeDiff)
    const newEnd = new Date(new Date(movedEvent.endTime).getTime() + timeDiff)

    // Check for overlapping events in the destination date
    const isOverlapping = updatedEvents[destinationDate]?.some(e => {
      const eStart = new Date(e.startTime).getTime()
      const eEnd = new Date(e.endTime).getTime()
      return (newStart.getTime() < eEnd && newEnd.getTime() > eStart)
    })

    if (isOverlapping) {
      alert('This event overlaps with an existing event in the destination date. The event will not be moved.')
      // Put the event back in its original position
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
      <FilterEvents
        setFilter={setFilter}
        filteredEvents={filteredEvents}
        onEventClick={handleFilteredEventClick}
      />
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

