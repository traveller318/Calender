import { Event } from '../utils/types';

// Function to export events in either JSON or CSV format
export const exportEvents = (events: Event[], format: 'json' | 'csv'): string => {
  // Format events for export
  const formattedEvents = events.map(event => ({
    event_id: parseInt(event.id), // Convert to number to avoid scientific notation
    title: event.title,
    category: event.category,
    date: new Date(event.startTime).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }), // Format as MM/DD/YYYY
    start_time: new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    end_time: new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: event.description || ''
  }));

  if (format === 'json') {
    // Return formatted JSON string
    return JSON.stringify(formattedEvents, null, 2);
  } else {
    // Create CSV header
    const header = 'Event ID,Title,Category,Date,Start Time,End Time,Description';
    
    // Create CSV rows
    const rows = formattedEvents.map(event => {
      // Escape commas and quotes in text fields
      const escapedTitle = `"${event.title.replace(/"/g, '""')}"`;
      const escapedDescription = `"${event.description.replace(/"/g, '""')}"`;
      
      return [
        event.event_id,
        escapedTitle,
        event.category,
        event.date,
        event.start_time,
        event.end_time,
        escapedDescription
      ].join(',');
    });

    // Combine header and rows
    return [header, ...rows].join('\n');
  }
}

// Function to trigger file download in the browser
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  // Create a temporary anchor element
  const a = document.createElement('a');
  // Create a Blob with the file content
  const file = new Blob([content], { type: contentType });
  // Set the download link
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  // Trigger the download
  a.click();
  // Clean up
  URL.revokeObjectURL(a.href);
}

