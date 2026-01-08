"use server";

import { prisma } from "@/lib/prisma";
import { defaultSettings, defaultImages } from "@/lib/defaultSettings";

export async function updateSettingsWithDefaults() {
  try {
    console.log('开始处理基本设置...');
    
    // 不使用事务，直接处理所有设置
    // 并行处理所有默认设置，提高效率
    const settingPromises = defaultSettings.map(async (setting) => {
      console.log(`处理设置: ${setting.key}`);
      try {
        await prisma.siteSetting.upsert({
          where: { key: setting.key },
          update: {},
          create: setting,
        });
        console.log(`设置 ${setting.key} 处理完成`);
        return { success: true, key: setting.key };
      } catch (error) {
        console.error(`处理设置 ${setting.key} 失败:`, error);
        throw new Error(`设置初始化失败: ${setting.key}`);
      }
    });
    
    // 等待所有设置处理完成
    await Promise.all(settingPromises);
    
    console.log('开始处理默认图片...');
    
    // 处理默认图片
    const imagePromises = defaultImages.map(async (imageConfig) => {
      console.log(`处理图片: ${imageConfig.name}`);
      const imageSettingPromises: Promise<any>[] = [];
      
      // 处理单个图片
      if (imageConfig.image) {
        // 为关联的设置键添加图片路径（只创建不存在的设置）
        for (const settingKey of imageConfig.settingKeys) {
          imageSettingPromises.push((async () => {
            console.log(`处理设置 ${settingKey.key} 的图片路径`);
            try {
              // 使用upsert，只在设置不存在时创建
              await prisma.siteSetting.upsert({
                where: { key: settingKey.key },
                update: {},  // 不更新已有设置
                create: {
                  key: settingKey.key,
                  value: imageConfig.image,
                  type: 'string',
                  group: 'basic',
                  description: `图片设置: ${imageConfig.name}`
                }
              });
              console.log(`设置 ${settingKey.key} 的图片路径处理完成`);
              return { success: true, key: settingKey.key };
            } catch (error) {
              console.error(`处理设置 ${settingKey.key} 的图片路径失败:`, error);
              throw new Error(`图片设置初始化失败: ${settingKey.key}`);
            }
          })());
        }
      }
      
      // 处理图片数组（如轮播图）
      if (imageConfig.images && imageConfig.images.length > 0) {
        for (const settingKey of imageConfig.settingKeys) {
          imageSettingPromises.push((async () => {
            console.log(`处理设置 ${settingKey.key} 的图片数组`);
            try {
              // 将图片数组转换为逗号分隔的字符串
              const imagesString = imageConfig.images.join(',');
              
              // 使用upsert，只在设置不存在时创建
              await prisma.siteSetting.upsert({
                where: { key: settingKey.key },
                update: {},  // 不更新已有设置
                create: {
                  key: settingKey.key,
                  value: imagesString,
                  type: 'string',
                  group: 'feature',
                  description: `图片数组设置: ${imageConfig.name}`
                }
              });
              console.log(`设置 ${settingKey.key} 的图片数组处理完成`);
              return { success: true, key: settingKey.key };
            } catch (error) {
              console.error(`处理设置 ${settingKey.key} 的图片数组失败:`, error);
              throw new Error(`图片数组设置初始化失败: ${settingKey.key}`);
            }
          })());
        }
      }
      
      // 等待当前图片的所有设置处理完成
      return await Promise.all(imageSettingPromises);
    });
    
    // 等待所有图片设置处理完成
    await Promise.all(imagePromises);
    
    console.log('所有设置和图片处理完成');
    return true;
  } catch (error) {
    console.error('设置初始化过程中发生错误:', error);
    // 确保抛出的错误是Error类型，并且有明确的错误信息
    const errorMessage = error instanceof Error ? error.message : '数据库初始化失败';
    throw new Error(errorMessage);
  }
}