import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainFeature from '../components/MainFeature';

const Home = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Update stats
    const completed = tasks.filter(task => task.isCompleted).length;
    setStats({
      total: tasks.length,
      completed,
      pending: tasks.length - completed
    });
  }, [tasks]);
  
  const addTask = (newTask) => {
    setTasks(prevTasks => [
      ...prevTasks,
      {
        ...newTask,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        isCompleted: false
      }
    ]);
  };
  
  const toggleTaskCompletion = (id) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };
  
  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };
  
  const updateTask = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() } : task
      )
    );
  };

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