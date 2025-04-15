import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMsg('Please enter your email');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await resetPassword(email);
      setSuccessMsg('Password reset instructions have been sent to your email.');
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrorMsg(error.message || 'Failed to send reset instructions. Please try again.');
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
        <h1 className="text-2xl font-bold text-center mb-4 text-surface-800 dark:text-surface-100">
          Reset your password
        </h1>
        
        <p className="text-center text-surface-600 dark:text-surface-400 mb-6">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        {errorMsg && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6">
            {successMsg}
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
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Sending instructions...' : 'Reset Password'}
          </motion.button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link to="/signin" className="font-medium text-primary hover:text-primary-600">
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;