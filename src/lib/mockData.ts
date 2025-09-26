export const analyticsData = {
  overview: {
    totalUsers: 24563,
    totalRevenue: 89420,
    conversionRate: 3.24,
    bounceRate: 42.5,
    growthData: [
      { month: 'Jan', users: 18500, revenue: 65000 },
      { month: 'Feb', users: 19200, revenue: 68500 },
      { month: 'Mar', users: 21100, revenue: 72300 },
      { month: 'Apr', users: 22800, revenue: 78900 },
      { month: 'May', users: 23900, revenue: 84200 },
      { month: 'Jun', users: 24563, revenue: 89420 },
    ]
  },
  
  recentActivity: [
    { id: 1, user: 'john@example.com', action: 'Completed purchase', time: '2 mins ago', value: '$299' },
    { id: 2, user: 'sarah@example.com', action: 'Started trial', time: '5 mins ago', value: 'Free' },
    { id: 3, user: 'mike@example.com', action: 'Upgraded plan', time: '12 mins ago', value: '$99' },
    { id: 4, user: 'lisa@example.com', action: 'Downloaded report', time: '18 mins ago', value: '-' },
    { id: 5, user: 'alex@example.com', action: 'Created project', time: '25 mins ago', value: '-' },
  ],
  
  topPages: [
    { page: '/dashboard', views: 12549, percentage: 28.5 },
    { page: '/pricing', views: 8932, percentage: 20.3 },
    { page: '/features', views: 7421, percentage: 16.9 },
    { page: '/about', views: 5687, percentage: 12.9 },
    { page: '/contact', views: 4321, percentage: 9.8 },
  ],
  
  deviceStats: [
    { device: 'Desktop', count: 14563, percentage: 59.3 },
    { device: 'Mobile', count: 7892, percentage: 32.1 },
    { device: 'Tablet', count: 2108, percentage: 8.6 },
  ],
  
  notifications: [
    { id: 1, title: 'Revenue Goal Achieved', message: 'Monthly revenue target exceeded by 12%', time: '1 hour ago', type: 'success' },
    { id: 2, title: 'New User Milestone', message: '25K users milestone reached', time: '3 hours ago', type: 'info' },
    { id: 3, title: 'System Update', message: 'Analytics engine updated to v2.1', time: '6 hours ago', type: 'info' },
  ]
};

export const navigationItems = [
  { name: 'Overview', icon: 'BarChart3', path: '/dashboard', active: false },
  { name: 'Ingest', icon: 'Upload', path: '/ingest', active: false },

//   { name: 'Analytics', icon: 'TrendingUp', path: '/analytics', active: false },
//   { name: 'Users', icon: 'Users', path: '/users', active: false },
//   { name: 'Revenue', icon: 'DollarSign', path: '/revenue', active: false },
//   { name: 'Reports', icon: 'FileText', path: '/reports', active: false },
//   { name: 'Settings', icon: 'Settings', path: '/settings', active: false },
];
