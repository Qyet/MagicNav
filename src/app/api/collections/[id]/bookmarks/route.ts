import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Folder, Bookmark } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

// 定义返回数据的类型
interface FolderWithItems extends Folder {
  items: Array<(Folder | Bookmark) & { type: 'folder' | 'bookmark' }>;
}

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
    const folderId = searchParams.get("folderId");
    const includeSubfolders = searchParams.get("includeSubfolders") === "true";
    const sortField = searchParams.get("sortField") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const pageSize = parseInt(searchParams.get("pageSize") || "100");

    // 并行执行书签总数查询和当前书签查询
    const [totalBookmarks, currentBookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: {
          collectionId: id,
        }
      }),
      // 获取当前文件夹中的书签
      prisma.bookmark.findMany({
        where: {
          collectionId: id,
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
      })
    ]);

    // 获取子文件夹及其内容
    const subfolders = await Promise.all(
      (await prisma.folder.findMany({
        where: {
          collectionId: id,
          parentId: folderId || null
        },
        orderBy: {
          [sortField]: sortOrder as 'asc' | 'desc',
        },
      })).map(async (folder) => {
        // 并行获取文件夹内的书签、子文件夹和总书签数
        const [bookmarks, childFolders, bookmarkCount] = await Promise.all([
          prisma.bookmark.findMany({
            where: {
              folderId: folder.id
            },
            ...(pageSize ? { take: pageSize } : {}),
            orderBy: {
              [sortField]: sortOrder as 'asc' | 'desc',
            }
          }),
          prisma.folder.findMany({
            where: {
              parentId: folder.id
            },
            orderBy: {
              [sortField]: sortOrder as 'asc' | 'desc',
            },
          }),
          prisma.bookmark.count({
            where: {
              folderId: folder.id
            }
          })
        ]);

        return {
          ...folder,
          items: [
            ...childFolders.map(f => ({ ...f, type: 'folder' as const })),
            ...bookmarks.map(b => ({ ...b, type: 'bookmark' as const }))
          ],
          bookmarkCount
        };
      })
    );

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