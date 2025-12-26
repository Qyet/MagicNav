import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    // 检查Collection是否存在以及是否可访问
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookmarks: true,
            folders: true
          }
        }
      }
    });
    
    // 如果Collection不存在，或者是私有Collection但用户未登录，返回404
    if (!collection || (!collection.isPublic && !session)) {
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, isPublic, sortOrder } = body;
    let slug = undefined;

    // 更新slug如果name改变了
    if (name) {
      slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // 检查slug是否已被其他collection使用
      const existingCollection = await prisma.collection.findFirst({
        where: {
          AND: [
            { slug },
            { NOT: { id } }
          ]
        }
      });

      if (existingCollection) {
        return NextResponse.json(
          { error: "The name or slug is already in use" },
          { status: 400 }
        );
      }
    }

    // 更新collection
    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        description,
        isPublic,
        slug,
        sortOrder,
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error("Failed to update collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // 首先删除关联的书签和文件夹
    await prisma.bookmark.deleteMany({
      where: { collectionId: id }
    });

    await prisma.folder.deleteMany({
      where: { collectionId: id }
    });

    // 然后删除collection
    await prisma.collection.delete({ where: { id } });

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
