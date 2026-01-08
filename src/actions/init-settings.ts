"use server";

import { prisma } from "@/lib/prisma";
import { defaultSettings, defaultImages } from "@/lib/defaultSettings";

export async function updateSettingsWithDefaults() {
  try {
    console.log('开始处理基本设置...');
    
    // 使用事务确保所有操作要么全部成功，要么全部失败
    await prisma.$transaction(async (tx) => {
      // 处理所有默认设置
      for (const setting of defaultSettings) {
        console.log(`处理设置: ${setting.key}`);
        try {
          await tx.siteSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
          });
          console.log(`设置 ${setting.key} 处理完成`);
        } catch (error) {
          console.error(`处理设置 ${setting.key} 失败:`, error);
          throw new Error(`设置初始化失败: ${setting.key}`);
        }
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
            try {
              // 检查设置是否存在，如果不存在则创建
              const existingSetting = await tx.siteSetting.findUnique({
                where: { key: settingKey.key }
              });
              
              if (existingSetting) {
                await tx.siteSetting.update({
                  where: { key: settingKey.key },
                  data: { value: imageConfig.image }
                });
              } else {
                // 创建新的设置
                await tx.siteSetting.create({
                  data: {
                    key: settingKey.key,
                    value: imageConfig.image,
                    type: 'string',
                    group: 'basic',
                    description: `图片设置: ${imageConfig.name}`
                  }
                });
              }
              console.log(`设置 ${settingKey.key} 的图片路径更新完成`);
            } catch (error) {
              console.error(`更新设置 ${settingKey.key} 的图片路径失败:`, error);
              throw new Error(`图片设置初始化失败: ${settingKey.key}`);
            }
          }
        }
        
        // 处理图片数组（如轮播图）
        if (imageConfig.images && imageConfig.images.length > 0) {
          for (const settingKey of imageConfig.settingKeys) {
            console.log(`更新设置 ${settingKey.key} 的图片数组`);
            try {
              // 将图片数组转换为逗号分隔的字符串
              const imagesString = imageConfig.images.join(',');
              
              // 更新或创建设置
              await tx.siteSetting.upsert({
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
              console.log(`设置 ${settingKey.key} 的图片数组更新完成`);
            } catch (error) {
              console.error(`更新设置 ${settingKey.key} 的图片数组失败:`, error);
              throw new Error(`图片数组设置初始化失败: ${settingKey.key}`);
            }
          }
        }
      }
    });
    
    console.log('所有设置和图片处理完成');
    return true;
  } catch (error) {
    console.error('设置初始化过程中发生错误:', error);
    // 重新抛出错误，以便上层处理
    throw error instanceof Error ? error : new Error('数据库初始化失败');
  }
}