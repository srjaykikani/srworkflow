
import { Moon, Sun } from 'lucide-react';
import { useColorTheme } from '../hooks/useColorTheme';
import { toast } from '@/components/ui/sonner';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useColorTheme();

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`, {
      duration: 2000,
    });
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 dark:bg-muted dark:hover:bg-muted/80 
      transition-all duration-300 ease-in-out transform shadow-sm hover:shadow focus:outline-none 
      focus:ring-2 focus:ring-primary/40 dark:focus:ring-primary/30"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200 animate-enter" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400 animate-enter" />
      )}
      <span className="sr-only">{theme === 'light' ? 'Dark' : 'Light'} mode</span>
    </button>
  );
};

export default ThemeToggle;
