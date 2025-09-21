const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-yellow-500 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-400 hover:from-yellow-500 hover:to-orange-600 shadow-lg' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 hover:from-indigo-600 hover:to-purple-700 shadow-lg'
      }`}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="flex items-center gap-2">
        <span>{isDarkMode ? '☀️' : '🌙'}</span>
        <span>{isDarkMode ? 'Light' : 'Dark'}</span>
      </div>
    </button>
  );
};

export default ThemeToggle;
