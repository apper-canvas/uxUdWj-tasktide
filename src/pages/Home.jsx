import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainFeature from '../components/MainFeature';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const { tasks, stats, addTask, toggleTaskCompletion, deleteTask, updateTask } = useTasks();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-6 text-surface-800 dark:text-surface-100">
            Welcome to TaskTide
          </h1>
          <p className="text-xl text-surface-600 dark:text-surface-400 mb-8 max-w-2xl mx-auto">
            The simple, effective way to manage your tasks and boost productivity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signin" className="btn btn-primary">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-outline">
              Create Account
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Create Tasks</h3>
              <p className="text-surface-600 dark:text-surface-400 text-center">
                Easily add new tasks with titles, descriptions, and priority levels.
              </p>
            </div>
            
            <div className="card p-6">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Organize</h3>
              <p className="text-surface-600 dark:text-surface-400 text-center">
                Sort and filter your tasks by date, priority, or completion status.
              </p>
            </div>
            
            <div className="card p-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Track Progress</h3>
              <p className="text-surface-600 dark:text-surface-400 text-center">
                Monitor your productivity with visual stats and completion metrics.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-surface-800 dark:text-surface-100">
          Manage Your Tasks with Ease
        </h1>
        <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
          Stay organized and boost your productivity with TaskTide's intuitive task management system.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
          >
            <h3 className="text-lg font-semibold mb-2 text-primary">Total Tasks</h3>
            <p className="text-3xl font-bold text-surface-800 dark:text-white">{stats.total}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary/20 dark:to-secondary/10"
          >
            <h3 className="text-lg font-semibold mb-2 text-secondary">Completed</h3>
            <p className="text-3xl font-bold text-surface-800 dark:text-white">{stats.completed}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card p-6 bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10"
          >
            <h3 className="text-lg font-semibold mb-2 text-accent">Pending</h3>
            <p className="text-3xl font-bold text-surface-800 dark:text-white">{stats.pending}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <MainFeature 
        tasks={tasks}
        onAddTask={addTask}
        onToggleTask={toggleTaskCompletion}
        onDeleteTask={deleteTask}
        onUpdateTask={updateTask}
      />
    </div>
  );
};

export default Home;