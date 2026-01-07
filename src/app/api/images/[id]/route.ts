import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: params.id }
    })

    if (!image) {
      console.error(`Image not found: ${params.id}`);
      return new NextResponse(null, { status: 404, statusText: 'Image not found' })
    }

    // 构建完整的文件路径
    const fullPath = path.join(process.cwd(), 'public', image.filePath);
    
    try {
      // 读取文件内容
      const fileContent = await fs.readFile(fullPath);

      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': image.mimeType,
          'Content-Length': image.size.toString()
        }
      })
    } catch (fileError) {
      console.error(`Failed to read image file ${fullPath}:`, fileError);
      if (fileError instanceof Error && 'code' in fileError) {
        if (fileError.code === 'ENOENT') {
          return new NextResponse(null, { status: 404, statusText: 'Image file not found on disk' });
        } else if (fileError.code === 'EACCES') {
          return new NextResponse(null, { status: 500, statusText: 'Permission error reading image file' });
        }
      }
      throw fileError; // 重新抛出其他文件错误
    }
  } catch (error) {
    console.error('Image API error:', error);
    if (error instanceof Error) {
      return new NextResponse(`Image API Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}