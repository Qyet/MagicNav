'use server'

import { prisma } from "@/lib/prisma";
import { z } from 'zod';


// 图片设置验证模式
const SettingImageSchema = z.object({
  settingKey: z.string().min(1, 'Setting key cannot be empty'),
  file: z.instanceof(File),
  imageId: z.string().optional()
});

// 上传图片的函数
async function uploadImage(file: File, existingImageId?: string) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 创建文件存储路径
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${file.name.substring(file.name.lastIndexOf('.'))}`;
      const filePath = `public/uploads/images/${filename}`;
      
      // 保存图片到文件系统
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, buffer);

      // 只更新 Image 表，不动 SettingImage
      const image = await prisma.image.upsert({
        where: { id: existingImageId || '' },
        update: {
          name: file.name,
          filePath: `/uploads/images/${filename}`, // 存储相对路径
          mimeType: file.type,
          size: file.size,
          description: `Setting image: ${file.name}`
        },
        create: {
          name: file.name,
          filePath: `/uploads/images/${filename}`, // 存储相对路径
          mimeType: file.type,
          type: 'setting',
          size: file.size,
          description: `Setting image: ${file.name}`
        },
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true
        }
      });

      return image;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image ${file.name}`);
    }
  }

export async function updateSettingImage(formData: FormData) {
  const settingKey = formData.get('settingKey') as string;
  const imageId = formData.get('imageId') as string | null;
  const file = formData.get('file') as File;

  if (!settingKey || !file) {
    throw new Error('Missing required parameters');
  }

  const setting = await prisma.siteSetting.findUnique({
    where: { key: settingKey },
    include: {
      images: {
        select: { imageId: true }
      }
    }
  });

  if (!setting) {
    throw new Error(`Could not find the corresponding setting item: ${settingKey}`);
  }

  const existingImageId = imageId || setting.images[0]?.imageId;

  if (!existingImageId) {
    throw new Error(`Could not find the corresponding image: ${settingKey}`);
  }

  // const validatedData = SettingImageSchema.parse({ 
  //   settingKey, 
  //   file, 
  //   imageId: existingImageId 
  // });

  const uploadedImage = await uploadImage(file, existingImageId);



  return { 
    settingKey,
    success: true, 
    image: uploadedImage 
  };
}