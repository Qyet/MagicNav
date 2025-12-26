import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    // 先检查Collection是否存在以及是否可访问
    const collection = await prisma.collection.findUnique({
      where: { id },
      select: { isPublic: true }
    });
    
    // 如果Collection不存在，或者是私有Collection但用户未登录，返回404
    if (!collection || (!collection.isPublic && !session)) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const parentId = searchParams.get("parentId");

    const folders = await prisma.folder.findMany({
      where: {
        collectionId: id,
        ...(all ? {} : { parentId: parentId || null }),
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Failed to get folders:", error);
    return NextResponse.json(
      { error: "Failed to get folders" },
      { status: 500 }
    );
  }
}
