import { NextRequest, NextResponse } from "next/server";
import {
  AccessToken,
  AccessTokenOptions,
  VideoGrant,
} from "livekit-server-sdk";
import { generateRoomHash } from "@/lib/utils";
type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};
const COOKIE_KEY = "random-participant-postfix";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get("roomName");
    const participantName = searchParams.get("participantName");
    const metaData = searchParams.get("metaData");
    const region = searchParams.get("region");
    let randomParticipantPostFix = request.cookies.get(COOKIE_KEY)?.value;
    const liveKitServerUrl = process.env.LIVEKIT_URL;
    if (!liveKitServerUrl) {
      return NextResponse.json(
        { error: "LiveKit server URL is not set" },
        { status: 500 }
      );
    }
    if (typeof roomName !== "string") {
      return new NextResponse("Missing required query parameter: roomName", {
        status: 400,
        headers: corsHeaders,
      });
    }
    if (participantName === null) {
      return new NextResponse(
        "Missing required query parameter: participantName",
        { status: 400, headers: corsHeaders }
      );
    }
    if (!randomParticipantPostFix) {
        randomParticipantPostFix = generateRoomHash();
    }
    const connectionDetails: ConnectionDetails = {
      serverUrl: liveKitServerUrl,
      roomName: roomName,
      participantName: participantName,
      participantToken: randomParticipantPostFix,
    };
  } catch (err: unknown) {
    console.error("Error getting connection details:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
