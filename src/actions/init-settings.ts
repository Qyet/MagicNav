"use server";

import { prisma } from "@/lib/prisma";
import { defaultSettings, defaultImages } from "@/lib/defaultSettings";
import pLimit from "p-limit"; // 使用 p-limit 控制并发
import { headers } from "next/headers";

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

export async function updateSettingsWithDefaults() {
  // 尝试从多个来源获取 baseUrl
  const referer = headers().get('referer');
  const host = headers().get('host');
  
  let baseUrl = '';

  if (referer) {
    // 优先使用 Referer 的完整 URL
    baseUrl = new URL(referer).origin;
  } else if (host) {
    // 如果没有 Referer，使用 host
    // 开发环境使用 HTTP，生产环境使用 HTTPS
    baseUrl = host.includes('localhost') || host.includes('127.0.0.1') ? `http://${host}` : `https://${host}`;
  }

  console.log(`当前基础URL: ${baseUrl}`);

  try {
    // 使用并发处理
    const limit = pLimit(5); // 限制 5 个并发请求

    // 并发处理设置
    await Promise.all(
      defaultSettings.map((setting) =>
        limit(() => {
          console.log(`处理设置: ${setting.key}`);
          return prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: {
              key: setting.key,
              value: setting.value,
              type: setting.type,
              group: setting.group,
              description: setting.description,
            },
          });
        })
      )
    );

    // 并发处理图片
    await Promise.all(
      defaultImages.map(async (imageData) => {
        console.log(`处理图片: ${imageData.name}`);

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
                    console.log(`获取图片: ${baseUrl}${imagePath}`);
                    const buffer = await fetch(`${baseUrl}${imagePath}`).then(
                      (res) => res.arrayBuffer()
                    );

                    const image = await prisma.image.create({
                      data: {
                        name: imageData.name,
                        filePath: imagePath,
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
                        description: `默认 ${imageData.name} 为 ${settingKey.key}`,
                      },
                    });
                    console.log(`图片 ${imagePath} 处理成功`);
                  } catch (error) {
                    console.error(`处理图片 ${imagePath} 失败:`, error);
                    // 仅记录错误，不中断整个初始化过程
                  }
                })
              );
            }
          }
        }
      })
    );

    console.log("所有设置和图片初始化完成");
    return true;
  } catch (error) {
    console.error("初始化设置失败:", error);
    throw error;
  }
}