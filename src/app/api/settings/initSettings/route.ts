import { NextRequest, NextResponse } from 'next/server';
import { updateSettingsWithDefaults } from '@/actions/init-settings';


// 增加超时时间到最大值
export const maxDuration = 120; // 设置更长的超时时间，确保数据库初始化有足够时间完成
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 添加请求处理超时保护
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 110000); // 110秒超时
    });
    
    // 同时等待初始化完成或超时
    await Promise.race([updateSettingsWithDefaults(), timeoutPromise]);

    return NextResponse.json({ 
      message: 'Settings initialized successfully',
      status: 'success' 
    }, { status: 200 });
  } catch (error) {
    console.error('Settings initialization failed:', error);
    
    // 确保在任何情况下都返回有效的JSON响应
    try {
      return NextResponse.json({ 
        message: 'Settings initialization failed',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    } catch (finalError) {
      // 最后的防线，确保返回有效的响应
      console.error('Failed to create error response:', finalError);
      return new NextResponse(JSON.stringify({ 
        message: 'Critical error occurred',
        status: 'error',
        error: 'An unexpected error occurred'
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
