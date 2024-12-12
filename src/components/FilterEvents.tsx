import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Event } from '../utils/types';
import { debounce } from 'lodash';

// Define color scheme for different event categories
const eventColors = {
  work: 'bg-[#4285F4] text-white',
  personal: 'bg-[#34A853] text-white',
  other: 'bg-[#9E9E9E] text-white',
  education: 'bg-[#FBBC05] text-white',
  hobbies: 'bg-[#9C27B0] text-white',
  health: 'bg-[#EA4335] text-white',
  finance: 'bg-[#FFD700] text-black',
};

interface FilterEventsProps {
  setFilter: (filter: string) => void;
  filteredEvents: Event[];
  onEventClick: (event: Event) => void;
}

const FilterEvents: React.FC<FilterEventsProps> = ({ setFilter, filteredEvents, onEventClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Create a debounced version of setFilter to reduce unnecessary updates
  const debouncedFilter = useCallback(
    debounce((value: string) => {
      setFilter(value);
    }, 300),
    [setFilter]
  );

  // Update the filter when searchTerm changes
  useEffect(() => {
    debouncedFilter(searchTerm);
    return () => {
      debouncedFilter.cancel();
    };
  }, [searchTerm, debouncedFilter]);

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor="filter-events">Filter Events</Label>
      <Input
        id="filter-events"
        type="text"
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-96" // Increased width, responsive
      />
      {/* Display filtered events if there's a search term */}
      {searchTerm && filteredEvents.length > 0 && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-2 rounded-md cursor-pointer hover:opacity-80 ${eventColors[event.category]}`}
              onClick={() => onEventClick(event)}
            >
              <div className="font-semibold">{event.title}</div>
              <div className="text-sm">
                {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
              </div>
              <div className="text-sm italic">{event.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterEvents;

