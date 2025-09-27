'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import { useUser } from '@/hooks/useUser';
import IngestPage from '@/components/IngestPage';
import AuthGuard from '@/components/AuthGuard';
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Overview');
  const { user } = useUser();
  console.log(user);
  const pageVariants = {
    initial: { opacity: 1, x: 0 },
    animate: { 
      opacity: 1, 
      x: 0
    },
    exit: { 
      opacity: 1, 
      x: 0
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
          {activeItem === 'Overview' && (
            <Dashboard sidebarOpen={sidebarOpen} />
          )}
          {activeItem === 'Ingest' && (
            <IngestPage sidebarOpen={sidebarOpen} />
          )}
          {activeItem !== 'Overview' && activeItem !== 'Ingest' && (
              <div 
                className="min-h-screen bg-gray-50 transition-all duration-300 p-8 flex items-center justify-center"
                style={{
                  marginLeft: sidebarOpen ? '280px' : '80px'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {activeItem} Page
                  </h1>
                  <p className="text-gray-600">
                    This {activeItem.toLowerCase()} section is coming soon...
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}