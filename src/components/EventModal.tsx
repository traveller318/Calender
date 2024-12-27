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
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endTime, setEndTime] = useState('');
  const [endPeriod, setEndPeriod] = useState('AM');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Event['category']>('other');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingEvent) {
      const startDate = new Date(editingEvent.startTime);
      const endDate = new Date(editingEvent.endTime);
      
      setTitle(editingEvent.title);
      setStartTime(formatTime12Hour(startDate).time);
      setStartPeriod(formatTime12Hour(startDate).period);
      setEndTime(formatTime12Hour(endDate).time);
      setEndPeriod(formatTime12Hour(endDate).period);
      setDescription(editingEvent.description || '');
      setCategory(editingEvent.category);
    } else {
      setTitle('');
      setStartTime('09:00');
      setStartPeriod('AM');
      setEndTime('10:00');
      setEndPeriod('AM');
      setDescription('');
      setCategory('other');
    }
    setError(null);
  }, [editingEvent, selectedDate]);

  const formatTime12Hour = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      period
    };
  };

  const convertTo24Hour = (time: string, period: string) => {
    let [hours, minutes] = time.split(':').map(Number);

    // Adjust for AM/PM
    if (period === 'PM' && hours !== 12) {
      hours += 12; // Convert PM hours to 24-hour format
    } else if (period === 'AM' && hours === 12) {
      hours = 0; // Convert 12 AM to 0 hours (midnight)
    }

    return { hours, minutes };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startConverted = convertTo24Hour(startTime, startPeriod);
    const endConverted = convertTo24Hour(endTime, endPeriod);

    const newStartTime = new Date(selectedDate);
    newStartTime.setHours(startConverted.hours, startConverted.minutes);

    const newEndTime = new Date(selectedDate);
    newEndTime.setHours(endConverted.hours, endConverted.minutes);

    // Ensure start time is before end time
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
              <div className="flex gap-2">
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="flex-grow"
                />
                <Select value={startPeriod} onValueChange={setStartPeriod}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time
              </Label>
              <div className="flex gap-2">
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  className="flex-grow"
                />
                <Select value={endPeriod} onValueChange={setEndPeriod}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
