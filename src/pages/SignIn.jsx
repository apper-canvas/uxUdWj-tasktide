import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-8"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center"
          >
            <span className="text-white font-bold text-3xl">T</span>
          </motion.div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-surface-800 dark:text-surface-100">
          Sign in to TaskTide
        </h1>
        
        {errorMsg && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-surface-500" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="input pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-surface-500" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input pl-10"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary border-surface-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-600">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-surface-600 dark:text-surface-400">Don't have an account? </span>
          <Link to="/signup" className="font-medium text-primary hover:text-primary-600">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;