'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Bell,
  Search,
  MoreVertical,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { analyticsData } from '@/lib/mockData';
import MetricCard from './MetricCard';
import { Card } from './ui/card';

interface DashboardProps {
  sidebarOpen: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarOpen }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1
    }
  };

  const headerVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const deviceIcons = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Tablet
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 transition-all duration-300 p-8"
      style={{
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}
    >
      <motion.div 
        variants={headerVariants}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your analytics.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="outline-none text-sm w-40"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Bell size={20} className="text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          change={12.5}
          trend="up"
          icon={Users}
          delay={0}
        />
        <MetricCard
          title="Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          change={8.2}
          trend="up"
          icon={DollarSign}
          delay={0.1}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          change={-2.1}
          trend="down"
          icon={TrendingUp}
          delay={0.2}
        />
        <MetricCard
          title="Bounce Rate"
          value={`${analyticsData.overview.bounceRate}%`}
          change={-5.3}
          trend="up"
          icon={Activity}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Growth Overview</h3>
              <div className="flex space-x-2">
                {['7d', '30d', '90d'].map((period) => (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedPeriod === period
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.overview.growthData.map((data, index) => (
                <motion.div
                  key={data.month}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.users / 25000) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className="flex-1 bg-gradient-to-t from-black to-gray-600 rounded-t-sm min-h-8"
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {analyticsData.overview.growthData.map((data) => (
                <span key={data.month}>{data.month}</span>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Usage</h3>
            <div className="space-y-4">
              {analyticsData.deviceStats.map((device, index) => {
                const IconComponent = deviceIcons[device.device as keyof typeof deviceIcons];
                return (
                  <motion.div
                    key={device.device}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent size={20} className="text-gray-600" />
                      <span className="font-medium text-gray-900">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {device.count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {device.percentage}%
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <MoreVertical size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{activity.value}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
              <MoreVertical size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {analyticsData.topPages.map((page, index) => (
                <motion.div
                  key={page.page}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{page.page}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${page.percentage}%` }}
                          transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                          className="bg-black h-2 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {page.percentage}%
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-4">
                    {page.views.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
