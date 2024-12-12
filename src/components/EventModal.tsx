import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Event } from '../utils/types';
import { Clock, CalendarIcon, Type, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete: (eventId: string) => void;
  selectedDate: Date;
  editingEvent: Event | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  editingEvent,
}) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Event['category']>('other');
  const [error, setError] = useState<string | null>(null);

  // Effect to populate form fields when editing an event
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setStartTime(new Date(editingEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setEndTime(new Date(editingEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDescription(editingEvent.description || '');
      setCategory(editingEvent.category);
    } else {
      // Default values for new event
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
      setCategory('other');
    }
    setError(null);
  }, [editingEvent, selectedDate]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const[endHours, endMinutes] = endTime.split(':').map(Number);

    const newStartTime = new Date(selectedDate);
    newStartTime.setHours(startHours, startMinutes);

    const newEndTime = new Date(selectedDate);
    newEndTime.setHours(endHours, endMinutes);

    if (newStartTime >= newEndTime) {
      setError('End time must be after start time');
      return;
    }

    const event: Event = {
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      title,
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString(),
      description,
      category,
    };
    onSave(event);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Event Name
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category
            </Label>
            <Select value={category} onValueChange={(value: Event['category']) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="hobbies">Hobbies</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="h-24"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter className="sm:justify-between">
            {editingEvent && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(editingEvent.id)}
              >
                Delete Event
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{editingEvent ? 'Update' : 'Add'} Event</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;

