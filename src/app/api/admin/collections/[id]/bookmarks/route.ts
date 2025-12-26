import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Folder, Bookmark } from "@prisma/client";

// 定义返回数据的类型
interface FolderWithItems extends Folder {
  items: Array<(Folder | Bookmark) & { type: 'folder' | 'bookmark' }>;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const id = params.id;
    const folderId = searchParams.get("folderId");
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";



    // 先检查该集合下是否有书签（不带 folderId 条件）
    const totalBookmarks = await prisma.bookmark.count({
      where: {
        collectionId: id,
      }
    });



    // 获取书签，修改查询条件
    const currentBookmarks = await prisma.bookmark.findMany({
      where: {
        collectionId: id,
        // 如果 folderId 为 null 或 undefined，则获取根目录的书签
        // 如果 folderId 有值，则获取对应文件夹的书签
        ...(folderId ? { folderId } : { folderId: null })
      },
      orderBy: {
        [sortField]: sortOrder as 'asc' | 'desc',
      },
      include: {
        collection: {
          select: {
            name: true,
          },
        },
        folder: {
          select: {
            name: true,
          },
        },
      },
    });



    // 获取子文件夹
    const subfolders = await prisma.folder.findMany({
      where: {
        collectionId: id,
        parentId: folderId || null
      },
      orderBy: {
        name: 'asc'
      }
    });



    return NextResponse.json({
      currentBookmarks,
      subfolders,
    });

  } catch (error) {
    console.error("Failed to get content:", error);
    return NextResponse.json(
      { error: "Failed to get content", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
