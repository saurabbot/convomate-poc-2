import { NextRequest, NextResponse } from "next/server";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { roomName, participantName, participantIdentity, roomId } = body;

    if (!roomName || !roomId) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const serverUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !serverUrl) {
      return NextResponse.json(
        { error: "LiveKit configuration missing" },
        { status: 500 }
      );
    }

    const roomService = new RoomServiceClient(serverUrl, apiKey, apiSecret);

    try {
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 60 * 10, // Room expires after 10 minutes if empty
      });
    } catch (e: unknown) {
      const error = e as { message: string };
      if (error.message.includes("already exists")) {
      } else {
        console.error("Error creating room:", e);
        return NextResponse.json(
          { error: "Failed to create room" },
          { status: 500 }
        );
      }
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity || user.id,
      name: participantName || user.id,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      serverUrl,
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
