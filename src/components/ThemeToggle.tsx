import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  // Use the custom hook to access theme context
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {/* Render Sun icon for light theme, Moon icon for dark theme */}
      {theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      {/* Hidden text for accessibility */}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

