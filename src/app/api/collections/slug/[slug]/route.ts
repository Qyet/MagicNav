import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Define where clause with proper access control
    // If user is logged in, allow access to all collections (including private)
    // If user is not logged in, only allow access to public collections
    const whereClause = !session ? {
      slug,
      isPublic: true
    } : {
      slug
    };
    
    const collection = await prisma.collection.findFirst({
      where: whereClause
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Failed to get collection:", error);
    return NextResponse.json(
      { error: "Failed to get collection" },
      { status: 500 }
    );
  }
} 