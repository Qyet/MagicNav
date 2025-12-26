import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../auth/[...nextauth]/options";

export async function GET(
  request: Request,
  { params }: { params: { id: string; folderId: string } }
) {
  try {
    // 等待参数解析
    const { id, folderId } = await Promise.resolve(params);
    
    // 验证参数
    if (!id || !folderId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
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

    const path = [];
    let currentFolder = await prisma.folder.findUnique({
      where: { 
        id: folderId,
        collectionId: id // 确保文件夹属于正确的集合
      }
    });

    while (currentFolder) {
      path.unshift({
        id: currentFolder.id,
        name: currentFolder.name
      });
      
      if (!currentFolder.parentId) break;
      
      currentFolder = await prisma.folder.findUnique({
        where: { 
          id: currentFolder.parentId,
          collectionId: id
        }
      });
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error("Failed to get folder path:", error);
    return NextResponse.json(
      { error: "Failed to get folder path" },
      { status: 500 }
    );
  }
}
