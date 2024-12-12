# React Calendar App with Event Management

A modern, feature-rich calendar application built with React, TypeScript, and shadcn/ui components. This application allows users to manage events, view them in an intuitive calendar interface, and persist data locally.

## Features

### Calendar View
- Monthly calendar grid with properly aligned days
- Navigation between months using Previous/Next buttons
- Visual distinction between weekdays and weekends
- Highlighted current day and selected day

### Event Management
- Click-to-add event functionality
- Comprehensive event editing and deletion
- Event properties include:
  - Event name
  - Start and end times
  - Optional description
  - Color coding (work/personal/other/..)
- Overlap prevention for concurrent events
- Drag-and-drop event rescheduling

### Event List & Filtering
- Side panel display of events for selected day
- Keyword-based event filtering
- Export functionality (JSON/CSV formats)

### Data Persistence
- Local storage implementation for event data
- Persistent across page refreshes

## Project Structure
```
src/
├── assets/
├── components/
│   ├── ui/
│   ├── Calendar.tsx
│   ├── EventList.tsx
│   ├── EventModal.tsx
│   ├── FilterEvents.tsx
│   ├── SideDrawer.tsx
│   └── ThemeToggle.tsx
├── context/
│   └── ThemeContext.tsx
├── lib/
│   └── utils.ts
├── utils/
│   ├── dateUtils.ts
│   ├── eventStorage.ts
│   ├── exportEvents.ts
│   └── types.ts
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```

## Tech Stack
- React with TypeScript
- shadcn/ui for UI components
- Local Storage for data persistence
- TailwindCSS for styling

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/traveller318/Calender.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Deployment

Deployment link: https://calenderly.vercel.app/
