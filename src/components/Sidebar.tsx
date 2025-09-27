"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Settings,
  ChevronLeft,
  Upload,
  LogOut,
  Video,
} from "lucide-react";
import { navigationItems } from "@/lib/mockData";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

const iconMap = {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Settings,
  Upload,
  Video,
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  activeItem,
  setActiveItem,
}) => {
  const { user, logout } = useUser();
  const router = useRouter();
  const sidebarVariants = {
    open: {
      width: "280px",
    },
    closed: {
      width: "80px",
    },
  };

  const itemVariants = {
    hidden: { opacity: 1, x: 0 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
    hover: {
      scale: 1.05,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isOpen ? "open" : "closed"}
      className="bg-black text-white h-screen fixed left-0 top-0 z-50 border-r border-gray-800"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <motion.div
          className="flex items-center space-x-3"
          animate={{ opacity: isOpen ? 1 : 0 }}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm"></div>
          </div>
          {isOpen && (
            <motion.span
              className="font-semibold text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Convomate
            </motion.span>
          )}
        </motion.div>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={20} />
          </motion.div>
        </motion.button>
      </div>

      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <motion.button
                key={item.name}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onClick={() => {
                  if (item.name === 'Meeting Room') {
                    router.push('/meeting_room');
                  } else {
                    setActiveItem(item.name);
                  }
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                  activeItem === item.name
                    ? "bg-white text-black"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <IconComponent size={20} />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {isOpen && (
        <motion.div
          className="absolute bottom-6 left-4 right-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full flex items-center space-x-2 px-3 py-2  text-white text-sm font-medium rounded-md transition-colors bg-black"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;
