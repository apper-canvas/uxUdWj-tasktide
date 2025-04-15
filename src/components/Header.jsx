import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, User, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ darkMode, toggleDarkMode }) => {
  const { user } = useAuth();

  return (
    <header className="py-4 px-6 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
          >
            <span className="text-white font-bold text-lg">T</span>
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TaskTide
          </h1>
        </Link>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/" className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <Home size={20} className="text-surface-600 dark:text-surface-400" />
              </Link>
              <Link to="/profile" className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <User size={20} className="text-surface-600 dark:text-surface-400" />
              </Link>
            </>
          ) : (
            <Link to="/signin" className="text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary">
              Sign In
            </Link>
          )}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-surface-600" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;