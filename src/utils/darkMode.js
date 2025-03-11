// Check for dark mode preference
const initializeDarkMode = () => {
  // Check if user has already set a preference
  const darkMode = localStorage.getItem('darkMode');
  
  if (darkMode === null) {
    // If no preference is set, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    localStorage.setItem('darkMode', prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  } else if (darkMode === 'true') {
    document.documentElement.classList.add('dark');
  }
};

export default initializeDarkMode; 