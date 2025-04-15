import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function useTasks() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const { user } = useAuth();

  // Fetch tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setStats({
        total: 0,
        completed: 0,
        pending: 0
      });
      setLoading(false);
    }
  }, [user]);

  // Update stats when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter(task => task.is_completed).length;
      setStats({
        total: tasks.length,
        completed,
        pending: tasks.length - completed
      });
    } else {
      setStats({
        total: 0,
        completed: 0,
        pending: 0
      });
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (newTask) => {
    try {
      setLoading(true);
      setError(null);
      
      const taskToAdd = {
        title: newTask.title,
        description: newTask.description || '',
        priority: newTask.priority || 'medium',
        is_completed: false,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToAdd])
        .select();
      
      if (error) throw error;
      
      setTasks(prev => [data[0], ...prev]);
      return data[0];
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id)
        .select();
      
      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === updatedTask.id ? data[0] : task
        )
      );
      return data[0];
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // First find the task to get its current completion status
      const taskToToggle = tasks.find(task => task.id === id);
      if (!taskToToggle) throw new Error('Task not found');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          is_completed: !taskToToggle.is_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? data[0] : task
        )
      );
      return data[0];
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tasks,
    stats,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}