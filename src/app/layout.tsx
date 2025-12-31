
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster as SonnerToaster } from "sonner";
import type { Metadata, ResolvingMetadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'

export const generateMetadata = async (
  {},
  parent: ResolvingMetadata
): Promise<Metadata> => {
  // 使用静态默认值，避免数据库查询
  const websiteName = "MagicNav - Smart Bookmark Management & Organization Platform";
  const description = "Organize, manage and share your bookmarks efficiently with MagicNav. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.";
  const keywords = "bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const faviconUrl = "/favicon/favicon.ico";

  return {
    title: websiteName,
    description,
    keywords,
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
      ],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  interface AnalyticsMap {
    googleAnalyticsId: string;
    clarityId: string;
    [key: string]: string;
  }

  // 直接从环境变量获取统计代码，或使用空字符串，避免数据库查询
  const analyticsMap: AnalyticsMap = {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "",
    clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || "",
  };

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
