"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";

interface IngestPageProps {
  sidebarOpen: boolean;
}

const IngestPage: React.FC<IngestPageProps> = ({ sidebarOpen }) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleIngest = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: inputValue }),
      });

      const data = await response.json();

      setTimeout(() => {
        setResult({
          success: response.ok,
          message:
            data.message ||
            (response.ok
              ? "Data ingested successfully!"
              : "Failed to ingest data"),
        });
        setIsLoading(false);
      }, 2000);
    } catch {
      setTimeout(() => {
        setResult({
          success: false,
          message: "Network error occurred",
        });
        setIsLoading(false);
      }, 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Data Ingestion
        </h1>
        <p className="text-gray-600 text-lg">
          Input a URL and we will fetch the data for you
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="data-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data Input
              </label>
              <textarea
                id="data-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a URL here..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleIngest}
              disabled={isLoading || !inputValue.trim()}
              className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 size={24} />
                  </motion.div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload size={24} />
                  <span>Ingest Data</span>
                </>
              )}
            </motion.button>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    className="relative"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={32} className="text-white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Processing Your Data
                    </h3>
                    <p className="text-gray-600">
                      This may take a few moments...
                    </p>
                  </div>

                  <motion.div
                    className="w-full max-w-xs bg-gray-200 rounded-full h-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="bg-black h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center space-x-3 ${
                  result.success
                    ? "bg-gray-50 border border-gray-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                {result.success ? (
                  <CheckCircle size={24} className="text-gray-600" />
                ) : (
                  <AlertCircle size={24} className="text-gray-600" />
                )}
                <span className="font-medium text-gray-900">
                  {result.message}
                </span>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default IngestPage;
