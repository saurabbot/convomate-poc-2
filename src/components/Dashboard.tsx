"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Image,
  Video,
  Link as LinkIcon,
  Bell,
  Search,
  Calendar,
  ExternalLink,
  Bot,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateRoomHash } from "@/lib/utils";

interface DashboardProps {
  sidebarOpen: boolean;
}

interface ContentItem {
  id: string;
  name: string;
  description: string | null;
  url: string;
  price: string | null;
  mainImage: string | null;
  createdAt: string;
  images: Array<{ id: string; url: string }>;
  videos: Array<{ id: string; url: string }>;
  _count: {
    images: number;
    videos: number;
  };
}

interface ContentResponse {
  success: boolean;
  data: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarOpen }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalItems: 0,
    totalImages: 0,
    totalVideos: 0,
    totalUrls: 0,
  });
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  useEffect(() => {
    fetchContent();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "12");

      const response = await fetch(`/api/content?${params}`);
      const result: ContentResponse = await response.json();

      if (result.success) {
        setContent(result.data);
        setStats({
          totalItems: result.pagination.totalCount,
          totalImages: result.data.reduce(
            (sum, item) => sum + item._count.images,
            0
          ),
          totalVideos: result.data.reduce(
            (sum, item) => sum + item._count.videos,
            0
          ),
          totalUrls: result.data.length,
        });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 transition-all duration-300 p-8"
      style={{
        marginLeft: sidebarOpen ? "280px" : "80px",
      }}
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Content Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and review your scraped content.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalImages}
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Image
                size={24}
                className="text-white"
                aria-label="Images icon"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVideos}
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Video size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">URLs Scraped</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUrls}
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <LinkIcon size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {loading ? (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading content...</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {content.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img
                  src={
                    item?.mainImage ||
                    "https://images.unsplash.com/photo-1758654307553-f067f0367f13?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8"
                  }
                  alt={item.name}
                  className="object-cover w-full h-full"
                />

                <div className="absolute top-3 right-3 flex space-x-2">
                  {item._count.images > 0 && (
                    <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                      <Image size={12} aria-label="Images count" />
                      <span>{item._count.images}</span>
                    </div>
                  )}
                  {item._count.videos > 0 && (
                    <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                      <Video size={12} aria-label="Videos count" />
                      <span>{item._count.videos}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.name}
                  </h3>
                  <motion.a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </motion.a>
                </div>

                {item.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.price && (
                    <span className="font-semibold text-gray-900">
                      {item.price}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 flex items-center justify-center bg-black text-white p-2 rounded-lg"
                  onClick={() => {
                    const contentId = item.id;
                    router.push(
                      `/meeting_room/${generateRoomHash()}?id=${contentId}`
                    );
                  }}
                >
                  <Bot size={16} className="mr-2" />
                  Talk to Agent
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {content.length === 0 && !loading && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No content found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start by ingesting some content from the Ingest page"}
          </p>
          {searchTerm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear Search
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
