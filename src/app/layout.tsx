
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster as SonnerToaster } from "sonner";
import { defaultSettings } from "@/lib/defaultSettings";
import { cache } from 'react'
import type { Metadata, ResolvingMetadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'

interface TableExistsResult {
  exists: boolean;
}

async function checkSiteSettingTableExists() {
  const result: TableExistsResult[] = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE  table_schema = 'public'
      AND    table_name   = 'SiteSetting'
    );
  `;
  return result[0].exists;
}

// 根布局的 generateMetadata 函数没有 params 参数
type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = async (
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  try {
    const tableExists = await checkSiteSettingTableExists();
    const keys = ["websiteName", "description", "keywords", "siteUrl", "faviconUrl", "ogImage"];
    
    let siteSettings: Array<{ id?: string; key: string; value: string | null }>;
    if (tableExists) {
      siteSettings = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: [...keys],
          },
        },
      });
    } else {
      siteSettings = [];
    }

    // console.log(siteSettings)

    // 使用类型断言处理 defaultSettings
    const fallbackSettings = defaultSettings.filter((setting) =>
      keys.includes(setting.key)
    ).map(setting => ({
      key: setting.key,
      value: setting.value
    }));

    // 合并设置，优先使用数据库中的设置
    const mergedSettings = siteSettings.length > 0 ? siteSettings : fallbackSettings;

    const settingsMap = mergedSettings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || "";
      return acc;
    }, {} as Record<string, string>);

    // const faviconBase =
    //   settingsMap.faviconUrl?.replace("favicon.ico", "") || "/favicon/";
    const siteUrl =
      settingsMap.siteUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";


    const imageBaseUrl = '/api/images/'


    const faviconSetting = mergedSettings.find(setting => setting.key === 'faviconUrl');
    let faviconId = '';
    
    // 只有当 faviconSetting 有 id 属性时，才查询数据库获取图片
    if (faviconSetting && 'id' in faviconSetting && faviconSetting.id) {
      const settingImage = await prisma.settingImage.findFirst({
        where: { settingId: faviconSetting.id },
        select: { imageId: true }
      });
      faviconId = settingImage?.imageId || '';
    }
    
    const faviconUrl = faviconId ? `${imageBaseUrl}${faviconId}` : '/favicon/favicon.ico'

    return {
      title:
        settingsMap.websiteName,
      description:
        settingsMap.description,
      keywords:
        settingsMap.keywords,
      metadataBase: new URL(siteUrl),
      alternates: {
        canonical: siteUrl,
      },
      icons: {
        icon: [
          {
            url: faviconUrl,
            sizes: "32x32",
            type: "image/x-icon",
          },
          // {
          //   url: `${faviconBase}favicon-16x16.png`,
          //   sizes: "16x16",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-32x32.png`,
          //   sizes: "32x32",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-192x192.png`,
          //   sizes: "192x192",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-512x512.png`,
          //   sizes: "512x512",
          //   type: "image/png",
          // },
        // apple: [
        //   {
        //     url: `${faviconBase}favicon-180x180.png`,
        //     sizes: "180x180",
        //     type: "image/png",
        //   },
        // ],
        ],
      },
    };
  } catch (error) {
    console.error("获取设置失败:", error);
    return {
      title: "MagicNav - Smart Bookmark Management & Organization Platform",
      description:
        "Organize, manage and share your bookmarks efficiently with MagicNav. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.",
      keywords:
        "bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization",
      icons: {
        icon: "/favicon/favicon.ico",
      },
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  interface AnalyticsMap {
    googleAnalyticsId: string;
    clarityId: string;
    [key: string]: string;
  }

  let analyticsMap: AnalyticsMap = {
    googleAnalyticsId: "",
    clarityId: "",
  };

  if (process.env.NODE_ENV === "production") {
    const tableExists = await checkSiteSettingTableExists();
    if (tableExists) {
      // 获取统计代码ID
      const analytics = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: ["googleAnalyticsId", "clarityId"],
          },
        },
      });

      if (analytics.length > 0) {
        analyticsMap = analytics.reduce((acc: AnalyticsMap, setting) => {
          acc[setting.key] = setting.value || "";
          return acc;
        }, { ...analyticsMap });
      }
    }
  }

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <SonnerToaster />
      </body>
      <Analytics clarityId={analyticsMap.clarityId} />
      {!!analyticsMap.googleAnalyticsId && <GoogleAnalytics gaId={analyticsMap.googleAnalyticsId} />}
    </html>
  );
}
