'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  delay = 0 
}) => {
  const cardVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: { 
      opacity: 1, 
      y: 0
    },
    hover: {
      y: -5,
      scale: 1.02
    }
  };

  const isPositive = trend === 'up';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <motion.h3 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.h3>
            {change && (
              <motion.div 
                className={`flex items-center space-x-1 text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
              >
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(change)}%</span>
              </motion.div>
            )}
          </div>
        </div>
        
        {Icon && (
          <motion.div 
            className="p-3 bg-gray-50 rounded-lg"
            whileHover={{ 
              backgroundColor: "#f3f4f6",
              scale: 1.1
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={24} className="text-gray-600" />
          </motion.div>
        )}
      </div>
      
      <motion.div 
        className="mt-4 pt-4 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        <p className="text-xs text-gray-500">
          {isPositive ? 'Increased' : 'Decreased'} from last month
        </p>
      </motion.div>
    </motion.div>
  );
};

export default MetricCard;
