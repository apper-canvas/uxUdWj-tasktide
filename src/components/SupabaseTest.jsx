import { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    loading: true,
    success: null,
    message: 'Checking connection...',
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await checkSupabaseConnection();
        setConnectionStatus({
          loading: false,
          success: result.success,
          message: result.message,
        });
      } catch (error) {
        setConnectionStatus({
          loading: false,
          success: false,
          message: `Error: ${error.message}`,
        });
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden mt-10">
      <div className="md:flex">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Supabase Connection Test</h1>
          
          {connectionStatus.loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse mr-2"></div>
              <p className="text-gray-600">Testing connection...</p>
            </div>
          ) : connectionStatus.success ? (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <p className="text-green-600">{connectionStatus.message}</p>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <p className="text-red-600">{connectionStatus.message}</p>
            </div>
          )}
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Details</h2>
            <p className="text-sm text-gray-600">
              <span className="font-medium">URL:</span> {supabase.supabaseUrl}
            </p>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Test Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;