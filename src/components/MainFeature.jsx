import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Edit, Trash2, Clock, Calendar, 
  AlertCircle, ChevronDown, ChevronUp, Plus
} from 'lucide-react';

const MainFeature = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateTask }) => {
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showForm]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      setErrorMessage("Task title cannot be empty");
      return;
    }
    
    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        ...newTask
      });
      setEditingTask(null);
    } else {
      onAddTask(newTask);
    }
    
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };
  
  const handleEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium'
    });
    setShowForm(true);
  };
  
  const cancelEdit = () => {
    setEditingTask(null);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };
  
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.isCompleted;
    if (filter === 'pending') return !task.isCompleted;
    return true;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      const valueA = priorityValues[a.priority] || 2;
      const valueB = priorityValues[b.priority] || 2;
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    if (sortBy === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    
    // Default sort by createdAt
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 dark:text-red-400';
      case 'low': return 'text-blue-500 dark:text-blue-400';
      default: return 'text-yellow-500 dark:text-yellow-400';
    }
  };
  
  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30';
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30';
      default: return 'bg-yellow-100 dark:bg-yellow-900/30';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-800 dark:text-surface-100">
            My Tasks
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in total
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              Completed
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </motion.button>
        </div>
      </div>
      
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-6 mb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-surface-800 dark:text-surface-100">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Task Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  ref={inputRef}
                  value={newTask.title}
                  onChange={handleInputChange}
                  placeholder="What needs to be done?"
                  className="input"
                />
                {errorMessage && (
                  <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  placeholder="Add details about this task..."
                  rows="3"
                  className="input"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Priority
                </label>
                <div className="flex gap-3">
                  {['low', 'medium', 'high'].map((priority) => (
                    <label 
                      key={priority}
                      className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        newTask.priority === priority
                          ? `border-2 ${getPriorityBg(priority)} border-${priority === 'high' ? 'red' : priority === 'low' ? 'blue' : 'yellow'}-500`
                          : 'border-surface-300 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={newTask.priority === priority}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className={getPriorityColor(priority)}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-outline"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="card overflow-hidden">
        <div className="p-4 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => toggleSort('createdAt')}
              className={`flex items-center gap-1 text-sm font-medium ${
                sortBy === 'createdAt' ? 'text-primary' : 'text-surface-600 dark:text-surface-400'
              }`}
            >
              <Clock size={16} />
              <span>Date</span>
              {sortBy === 'createdAt' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
            
            <button 
              onClick={() => toggleSort('priority')}
              className={`flex items-center gap-1 text-sm font-medium ${
                sortBy === 'priority' ? 'text-primary' : 'text-surface-600 dark:text-surface-400'
              }`}
            >
              <AlertCircle size={16} />
              <span>Priority</span>
              {sortBy === 'priority' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
            
            <button 
              onClick={() => toggleSort('title')}
              className={`hidden sm:flex items-center gap-1 text-sm font-medium ${
                sortBy === 'title' ? 'text-primary' : 'text-surface-600 dark:text-surface-400'
              }`}
            >
              <Calendar size={16} />
              <span>Title</span>
              {sortBy === 'title' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>
        
        {sortedTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
              <Calendar size={24} className="text-surface-500" />
            </div>
            <h3 className="text-lg font-medium text-surface-800 dark:text-surface-200 mb-1">
              No tasks found
            </h3>
            <p className="text-surface-600 dark:text-surface-400">
              {filter === 'all' 
                ? "You don't have any tasks yet. Add your first task to get started!"
                : filter === 'completed'
                  ? "You haven't completed any tasks yet."
                  : "You don't have any pending tasks."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-200 dark:divide-surface-700">
            <AnimatePresence>
              {sortedTasks.map((task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 flex items-start gap-3 ${
                    task.isCompleted ? 'bg-surface-50/50 dark:bg-surface-800/50' : ''
                  }`}
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      task.isCompleted 
                        ? 'bg-secondary border-secondary text-white' 
                        : 'border-surface-400 dark:border-surface-600 hover:border-secondary dark:hover:border-secondary'
                    }`}
                  >
                    {task.isCompleted && <Check size={12} />}
                  </button>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-medium break-words ${
                          task.isCompleted 
                            ? 'text-surface-500 dark:text-surface-500 line-through' 
                            : 'text-surface-800 dark:text-surface-200'
                        }`}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className={`mt-1 text-sm break-words ${
                            task.isCompleted 
                              ? 'text-surface-500 dark:text-surface-600' 
                              : 'text-surface-600 dark:text-surface-400'
                          }`}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBg(task.priority)} ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'medium'}
                          </span>
                          
                          <span className="text-xs text-surface-500 dark:text-surface-500">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(task)}
                      className="p-1.5 rounded-full text-surface-500 hover:text-primary hover:bg-surface-100 dark:hover:bg-surface-800"
                      disabled={task.isCompleted}
                      aria-label="Edit task"
                    >
                      <Edit size={16} className={task.isCompleted ? 'opacity-50' : ''} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-full text-surface-500 hover:text-red-500 hover:bg-surface-100 dark:hover:bg-surface-800"
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default MainFeature;