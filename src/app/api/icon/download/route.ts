import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // 下载图标
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch icon: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'image/png';
    const fileExtension = mimeType.split('/')[1] || 'png';
    const fileName = `icon-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;
    
    // 创建保存目录
    const saveDir = path.join(process.cwd(), 'public', 'bookmarkicon');
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }
    
    // 保存文件到文件系统
    const filePath = path.join(saveDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    // 生成访问URL
    const publicUrl = `/bookmarkicon/${fileName}`;
    
    return NextResponse.json({
      success: true,
      image: {
        name: fileName,
        mimeType,
        size: buffer.byteLength,
        url: publicUrl
      }
    });
    
  } catch (error) {
    console.error('Failed to download icon:', error);
    return NextResponse.json({ error: 'Failed to download icon' }, { status: 500 });
  }
}