import { NextRequest, NextResponse } from "next/server";
import { ZyteService, ScrapType } from "@/services/zyteService";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const url = body.data
    const scrapeType = ScrapType.PRODUCT
    if (!url || !scrapeType) {
      return NextResponse.json(
        { error: "URL and scrapType are required" },
        { status: 400 }
      );
    }
    const zyteService = new ZyteService();

    const data = await zyteService.getStructuredScrapedData(url, scrapeType);
    const { product } = data;
    console.log(product);
    const { name, price, mainImage, images, description, videos } = product;
    const scrapedContent = await prisma.scrapedContent.create({
      data: {
        url,
        name,
        price,
        createdBy: {
          connect: {
            id: user?.userId,
          },
        },
        mainImage: mainImage?.url || "",
        description,
        images: {
          create: images?.map((image) => ({ url: image.url })),
        },
        videos: {
          create: videos?.map((video) => ({ url: video.url })),
        },
      },
    });
  
    return NextResponse.json({ success: true, data: scrapedContent });
  } catch (error) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
