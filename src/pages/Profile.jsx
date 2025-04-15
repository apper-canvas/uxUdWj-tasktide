import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Clock, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      setErrorMsg(error.message || 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-surface-800 dark:text-surface-100">
            Profile
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            disabled={isLoading}
            className="btn btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white dark:hover:text-white flex items-center gap-2"
          >
            <LogOut size={18} />
            <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
          </motion.button>
        </div>
        
        {errorMsg && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div className="mr-4 bg-primary/10 p-3 rounded-full">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">
                User ID
              </h3>
              <p className="text-surface-800 dark:text-surface-100 font-medium">
                {user.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div className="mr-4 bg-primary/10 p-3 rounded-full">
              <Mail size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">
                Email
              </h3>
              <p className="text-surface-800 dark:text-surface-100 font-medium">
                {user.email}
              </p>
            </div>
          </div>
          
          {user.created_at && (
            <div className="flex items-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <div className="mr-4 bg-primary/10 p-3 rounded-full">
                <Clock size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">
                  Account Created
                </h3>
                <p className="text-surface-800 dark:text-surface-100 font-medium">
                  {format(new Date(user.created_at), 'PPP')}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;