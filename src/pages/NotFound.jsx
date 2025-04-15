import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <div className="mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }}
            className="text-9xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            404
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-surface-800 dark:text-surface-100">
            Page Not Found
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 btn btn-primary px-6 py-3"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;