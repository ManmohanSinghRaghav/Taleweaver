import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faSun, faMoon);

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="glass-button px-base py-sm text-sm font-light text-mono-600 dark:text-mono-400"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="flex items-center gap-sm">
        {isDarkMode ? <FontAwesomeIcon icon={faSun} className="w-4 h-4" /> : <FontAwesomeIcon icon={faMoon} className="w-4 h-4" />}
        <span className="text-caption font-light">{isDarkMode ? 'Light' : 'Dark'}</span>
      </div>
    </button>
  );
};

export default ThemeToggle;
