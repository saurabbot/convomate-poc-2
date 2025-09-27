import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AgentDispatchClient } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { handleOptionsRequest, corsHeaders } from "@/lib/cors";
export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { room, id } = body;

    if (!room) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return NextResponse.json(
        { error: "Server configuration is missing" },
        { status: 500, headers: corsHeaders }
      );
    }

    const roomName = room;
    const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || "context-agent";

    const agentDispatchClient = new AgentDispatchClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    // Check if there's already an active dispatch for this agent in this room
    const dispatches = await agentDispatchClient.listDispatch(roomName);
    const existingDispatch = dispatches.find(
      (dispatch) => dispatch.agentName === agentName
    );

    if (existingDispatch) {
      console.log(
        "Agent dispatch already exists for this room:",
        existingDispatch.id
      );
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }
    const scrapedContent = await prisma.scrapedContent.findUnique({
      where: {
        id: id,
      },
    });
    console.log("scrapedContent", scrapedContent);
    const agentMetaData = {
      userId: user.id,
      contentId: scrapedContent?.id,
      userName: user.name,
      url: scrapedContent?.url,
      contentName: scrapedContent?.name,
      price: scrapedContent?.price,
      description: scrapedContent?.description,
    };
    console.log("agentMetaData", agentMetaData);

    await agentDispatchClient.createDispatch(roomName, agentName, {
      metadata: JSON.stringify(agentMetaData),
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error requesting agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
