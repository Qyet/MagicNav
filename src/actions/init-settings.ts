"use server";

import { prisma } from "@/lib/prisma";
import { defaultSettings, defaultImages } from "@/lib/defaultSettings";
import pLimit from "p-limit"; // 推荐使用 p-limit 控制并发
import { headers } from "next/headers";

export async function updateSettingsWithDefaults() {
  // 尝试从多个来源获取 baseUrl
  const referer = headers().get('referer');
  const host = headers().get('host');
  const xForwardedProto = headers().get('x-forwarded-proto');
  
  let baseUrl = '';

  if (referer) {
    // 优先使用 Referer 的完整 URL
    baseUrl = new URL(referer).origin;
  } else if (host) {
    // 确定使用的协议
    let protocol = 'https';
    
    // 检查是否有代理协议头
    if (xForwardedProto) {
      protocol = xForwardedProto;
    } else if (host.includes('localhost') || host.includes('127.0.0.1')) {
      // 本地环境默认使用 HTTP
      protocol = 'http';
    }
    
    baseUrl = `${protocol}://${host}`;
  }



  try {
    // 使用事务确保数据库操作的原子性
    await prisma.$transaction(async (prisma) => {
      // 使用并发处理
      const limit = pLimit(5); // 限制 5 个并发请求

      // 并发处理设置
      await Promise.all(
        defaultSettings.map((setting) =>
          limit(() => 
            prisma.siteSetting.upsert({
              where: { key: setting.key },
              update: {},
              create: {
                key: setting.key,
                value: setting.value,
                type: setting.type,
                group: setting.group,
                description: setting.description,
              },
            })
          )
        )
      );

      // 存储需要清理的文件路径，用于事务失败时回滚
      const filesToCleanup: string[] = [];

      try {
        // 并发处理图片
        await Promise.all(
          defaultImages.map(async (imageData) => {

            for (const settingKey of imageData.settingKeys || []) {
              const setting = await prisma.siteSetting.findUnique({
                where: { key: settingKey.key },
              });

              if (setting) {
                const existingSettingImage = await prisma.settingImage.findFirst({
                  where: { settingId: setting.id },
                });

                if (!existingSettingImage) {
                  const imagesToProcess = imageData.images || [imageData.image];

                  await Promise.all(
                    imagesToProcess.map(async (imagePath) => {
                      try {
                        const response = await fetch(`${baseUrl}${imagePath}`);
                        const buffer = await response.arrayBuffer();
                        
                        // 创建文件存储路径
                        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${imagePath.substring(imagePath.lastIndexOf('.'))}`;
                        const filePath = `public/uploads/images/${filename}`;
                        
                        // 保存图片到文件系统
                        const fs = await import('fs/promises');
                        await fs.writeFile(filePath, Buffer.from(buffer));
                        filesToCleanup.push(filePath); // 记录需要清理的文件

                        const image = await prisma.image.create({
                          data: {
                            name: imageData.name,
                            filePath: `/uploads/images/${filename}`, // 存储相对路径
                            mimeType: getMimeType(imagePath),
                            type: imageData.type,
                            size: buffer.byteLength,
                            isPublic: true,
                          },
                        });

                        await prisma.settingImage.create({
                          data: {
                            settingId: setting.id,
                            imageId: image.id,
                            description: `Default ${imageData.name} for ${settingKey.key}`,
                          },
                        });

                      } catch (error) {
                        console.error(`Failed to process image ${imagePath}:`, error);
                        throw error;
                      }
                    })
                  );
                }
              }
            }
          })
        );
      } catch (imageError) {
        // 如果图片处理失败，清理已创建的文件
        const fs = await import('fs/promises');
        await Promise.all(
          filesToCleanup.map(async (filePath) => {
            try {
              await fs.unlink(filePath);
            } catch (cleanupError) {
              console.error(`Failed to cleanup file ${filePath}:`, cleanupError);
            }
          })
        );
        throw imageError;
      }
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw error;
  }
}

// 获取文件的 MIME 类型
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}
