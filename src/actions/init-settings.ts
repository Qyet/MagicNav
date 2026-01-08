"use server";

import { prisma } from "@/lib/prisma";
import { defaultSettings, defaultImages } from "@/lib/defaultSettings";

export async function updateSettingsWithDefaults() {
  console.log('开始处理基本设置...');
  
  // 处理所有默认设置
  for (const setting of defaultSettings) {
    console.log(`处理设置: ${setting.key}`);
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
    console.log(`设置 ${setting.key} 处理完成`);
  }
  
  console.log('开始处理默认图片...');
  
  // 处理默认图片
  for (const imageConfig of defaultImages) {
    console.log(`处理图片: ${imageConfig.name}`);
    
    // 处理单个图片
    if (imageConfig.image) {
      // 为关联的设置键更新图片路径
      for (const settingKey of imageConfig.settingKeys) {
        console.log(`更新设置 ${settingKey.key} 的图片路径`);
        
        // 检查设置是否存在，如果不存在则创建
        const existingSetting = await prisma.siteSetting.findUnique({
          where: { key: settingKey.key }
        });
        
        if (existingSetting) {
          await prisma.siteSetting.update({
            where: { key: settingKey.key },
            data: { value: imageConfig.image }
          });
        } else {
          // 创建新的设置
          await prisma.siteSetting.create({
            data: {
              key: settingKey.key,
              value: imageConfig.image,
              type: 'string',
              group: 'basic',
              description: `图片设置: ${imageConfig.name}`
            }
          });
        }
      }
    }
    
    // 处理图片数组（如轮播图）
    if (imageConfig.images && imageConfig.images.length > 0) {
      for (const settingKey of imageConfig.settingKeys) {
        console.log(`更新设置 ${settingKey.key} 的图片数组`);
        
        // 将图片数组转换为逗号分隔的字符串
        const imagesString = imageConfig.images.join(',');
        
        // 更新或创建设置
        await prisma.siteSetting.upsert({
          where: { key: settingKey.key },
          update: { value: imagesString },
          create: {
            key: settingKey.key,
            value: imagesString,
            type: 'string',
            group: 'feature',
            description: `图片数组设置: ${imageConfig.name}`
          }
        });
      }
    }
  }
  
  console.log('所有设置和图片处理完成');
  return true;
}