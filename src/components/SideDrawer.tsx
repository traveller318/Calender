import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Event } from '../utils/types';
import EventModal from './EventModal';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onSaveEvent: (event: Event) => void;
  existingEvents: Event[];
}

// Define color scheme for different event categories
const eventColors = {
  work: 'bg-blue-500 text-white',
  personal: 'bg-green-500 text-white',
  other: 'bg-gray-500 text-white',
  education: 'bg-yellow-500 text-black',
  hobbies: 'bg-purple-500 text-white',
  health: 'bg-red-500 text-white',
  finance: 'bg-yellow-400 text-black',
};

const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  selectedDate,
  events,
  onDeleteEvent,
  onSaveEvent,
  existingEvents,
}) => {
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);

  // Handler for adding a new event
  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  // Handler for editing an existing event
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // Handler for saving an event (new or edited)
  const handleSaveEvent = (event: Event) => {
    // Check for overlapping events
    const isOverlapping = events.some(e => {
      if (editingEvent && e.id === editingEvent.id) return false;
      const eStart = new Date(e.startTime).getTime();
      const eEnd = new Date(e.endTime).getTime();
      const newStart = new Date(event.startTime).getTime();
      const newEnd = new Date(event.endTime).getTime();
      return (newStart < eEnd && newEnd > eStart);
    });

    if (isOverlapping) {
      alert('This event overlaps with an existing event. Please choose a different time.');
      return;
    }

    onSaveEvent(event);
    setIsEventModalOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[540px] p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">
            Events for {selectedDate?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </SheetTitle>
        </SheetHeader>
        <div className="mb-6">
          <Button onClick={handleAddEvent} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          {events.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No events for this day.</p>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className={`p-4 rounded-lg shadow-md ${eventColors[event.category]}`}>
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <p className="text-sm mb-2 opacity-90">
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {event.description && <p className="text-sm mb-4 opacity-90">{event.description}</p>}
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEditEvent(event)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDeleteEvent(event.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={onDeleteEvent}
          selectedDate={selectedDate || new Date()}
          editingEvent={editingEvent}
          existingEvents={existingEvents}
        />
      </SheetContent>
    </Sheet>
  );
};

export default SideDrawer;

