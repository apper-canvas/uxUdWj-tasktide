import { useState, useEffect } from 'react';
import Header from './Header';

const Layout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-4 px-6 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 transition-colors duration-300">
        <div className="container mx-auto text-center text-sm text-surface-500 dark:text-surface-400">
          <p>TaskTide &copy; {new Date().getFullYear()} - Manage your tasks effortlessly</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;