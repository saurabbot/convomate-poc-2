"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  ControlBar,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import "./meeting-room.css";
import { useUser } from "@/hooks/useUser";
import AuthGuard from "@/components/AuthGuard";
import { useParams, useSearchParams } from "next/navigation";

const MeetingRoom = () => {
  const { user } = useUser();
  const [token, setToken] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string>("");
  const { id } = useParams();
  const searchParams = useSearchParams();

  const roomId = id as string;
  const roomName = `convomate-meeting-${roomId}`;
  const contentId = searchParams.get("id");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const generateToken = async () => {
      try {
        setIsConnecting(true);
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName,
            roomId,
            participantName: user?.name || "Anonymous",
            participantIdentity: user?.id || "anonymous",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
          setServerUrl(data.serverUrl);
        } else {
          console.error("Failed to generate token");
        }
      } catch (error) {
        console.error("Error generating token:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    if (user) {
      generateToken();
    }
  }, [user, roomName, roomId]);
  const requestAgent = useCallback(async () => {
    try {
      const response = await fetch("/api/livekit/request-agent", {
        method: "POST",
        body: JSON.stringify({ room: roomName, id: contentId }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("data", data);
      } else {
        console.error("Failed to request agent");
      }
    } catch (error) {
      console.error("Error requesting agent:", error);
    }
  }, [roomName, contentId]);

  useEffect(() => {
    if (contentId && token) {
      console.log("contentId", contentId);
      console.log("token generated, requesting agent in 3 seconds...");
      setTimeout(() => {
        requestAgent();
      }, 3000);
    }
  }, [contentId, requestAgent, token]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  if (isConnecting) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting to Meeting
            </h2>
            <p className="text-gray-600">Setting up your video conference...</p>
          </motion.div>
        </div>
      </AuthGuard>
    );
  }

  if (!token || !serverUrl) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connection Failed
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to connect to the meeting room. Please try again.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retry Connection
            </motion.button>
          </motion.div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gray-50"
      >
        <div className="h-screen">
          <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            style={{
              height: "100vh",
              width: "100%",
            }}
          >
            <VideoConference />
            <div className="lk-video-conference">
              <div className="lk-grid-layout">
                <GridLayout tracks={[]}>
                  <ParticipantTile />
                </GridLayout>
              </div>
              <div className="lk-control-bar">
                <ControlBar />
              </div>
            </div>
          </LiveKitRoom>
        </div>
      </motion.div>
    </AuthGuard>
  );
};

export default MeetingRoom;
