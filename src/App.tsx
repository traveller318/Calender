import { ThemeProvider } from './context/ThemeContext';
import Calendar from './components/Calender';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Calenderly</h1>
            <ThemeToggle />
          </div>
          <Calendar />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;

