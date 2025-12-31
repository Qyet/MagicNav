export interface SettingItem {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: 'basic' | 'seo' | 'feature' | 'analytics';
  description?: string;
}

export const defaultSettings: SettingItem[] = [
  // 基础设置
  {
    key: "websiteName",
    value: "MagicNav",
    type: "string",
    group: "basic",
    description: "网站名称"
  },
  {
    key: "logoUrl",
    value: "/logo.png",
    type: "string",
    group: "basic",
    description: "网站Logo (建议尺寸: 520x120px)"
  },
  {
    key: "faviconUrl",
    value: "/favicon.ico",
    type: "string",
    group: "basic",
    description: "网站图标"
  },
  {
    key: "copyrightText",
    value: "© 2025 MagicNav. All rights reserved.",
    type: "string",
    group: "basic",
    description: "版权信息"
  },
  {
    key: "contactEmail",
    value: "",
    type: "string",
    group: "basic",
    description: "联系邮箱"
  },
  {
    key: "showPoweredBy",
    value: "true",
    type: "boolean",
    group: "basic",
    description: "是否显示Powered by MagicNav"
  },


  // 社交媒体链接
  {
    key: "weixinUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "微信公众号链接"
  },
  {
    key: "behanceUrl",
    value: "https://www.behance.net/magictechdesigner",
    type: "string",
    group: "basic",
    description: "Behance链接"
  },
  {
    key: "dribbbleUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "Dribbble链接"
  },
  {
    key: "pinterestUrl",
    value: "https://pinterest.com/magictechdesigner/",
    type: "string",
    group: "basic",
    description: "Pinterest链接"
  },
  {
    key: "githubUrl",
    value: "https://github.com/Qyet/MagicNav",
    type: "string",
    group: "basic",
    description: "GitHub链接"
  },
  {
    key: "discordUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "Discord链接"
  },
  {
    key: "twitterUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "Twitter/X链接"
  },
  {
    key: "telegramUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "Telegram链接"
  },
  {
    key: "linkedinUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "LinkedIn链接"
  },
  {
    key: "youtubeUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "YouTube频道链接"
  },
  {
    key: "bilibiliUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "B站主页链接"
  },
  {
    key: "weiboUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "微博主页链接"
  },
  {
    key: "zhihuUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "知乎主页链接"
  },

  // SEO设置
  {
    key: "siteTitle",
    value: "MagicNav - Smart Bookmark Management & Organization Platform",
    type: "string",
    group: "seo",
    description: "网站标题"
  },
  {
    key: "description",
    value: "Organize, manage and share your bookmarks efficiently with MagicNav. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.",
    type: "string",
    group: "seo",
    description: "网站描述"
  },
  {
    key: "keywords",
    value: "bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization",
    type: "string",
    group: "seo",
    description: "关键词(用逗号分隔)"
  },
  {
    key: "siteUrl",
    value: "https://maiju.tech",
    type: "string",
    group: "seo",
    description: "网站URL"
  },
  {
    key: "ogImage",
    value: "https://maiju.tech/og-image.png",
    type: "string",
    group: "seo",
    description: "社交分享图片"
  },
  {
    key: "robots",
    value: "index, follow",
    type: "string",
    group: "seo",
    description: "搜索引擎爬虫设置"
  },
  {
    key: "author",
    value: "Qyet",
    type: "string",
    group: "seo",
    description: "作者信息"
  },

  // 统计分析
  {
    key: "googleAnalyticsId",
    value: "",
    type: "string",
    group: "analytics",
    description: "Google Analytics ID"
  },
  {
    key: "clarityId",
    value: "",
    type: "string",
    group: "analytics",
    description: "Microsoft Clarity ID"
  },
  {
    key: "umamiId",
    value: "",
    type: "string",
    group: "analytics",
    description: "Umami Analytics ID"
  },
  {
    key: "plausibleId",
    value: "",
    type: "string",
    group: "analytics",
    description: "Plausible Analytics ID"
  },
  {
    key: "gtagId",
    value: "",
    type: "string",
    group: "analytics",
    description: "Google Tag ID"
  },

  // 功能设置
  {
    key: "enableSearch",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用搜索功能"
  },
  {
    key: "enableBackToTop",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用返回顶部按钮"
  },
  {
    key: "enableSidebarAds",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用侧边栏广告"
  },
  {
    key: "sidebarAdsContent",
    value: "",
    type: "string",
    group: "feature",
    description: "侧边栏广告内容"
  },
  {
    key: "enableCtaButton",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用CTA按钮"
  },
  {
    key: "ctaButtonText",
    value: "Claim your MagicNav",
    type: "string",
    group: "feature",
    description: "CTA按钮文字"
  },
  {
    key: "ctaButtonLink",
    value: "https://maiju.tech",
    type: "string",
    group: "feature",
    description: "CTA按钮链接"
  },
  {
    key: "ctaButtonStyle",
    value: "primary",
    type: "string",
    group: "feature",
    description: "CTA按钮样式"
  },
  {
    key: "enableHeroBanner",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用Hero Banner"
  },
  {
    key: "heroBannerTitle",
    value: "Organize and Share Your Bookmarks Effortlessly",
    type: "string",
    group: "feature",
    description: "Hero Banner标题"
  },
  {
    key: "heroBannerDescription",
    value: "Create, manage and share personalized bookmark collections with MagicNav",
    type: "string",
    group: "feature",
    description: "Hero Banner描述"
  },
  {
    key: "heroBannerImage",
    value: "",
    type: "string",
    group: "feature",
    description: "Hero Banner图片"
  },
  {
    key: "heroBannerButtonText",
    value: "MagicNav",
    type: "string",
    group: "feature",
    description: "Hero Banner按钮文字"
  },
  {
    key: "heroBannerButtonLink",
    value: "https://maiju.tech",
    type: "string",
    group: "feature",
    description: "Hero Banner按钮链接"
  },
  {
    key: "heroBannerSponsorText",
    value: "Sponsored by",
    type: "string",
    group: "feature",
    description: "Hero Banner赞助商文本"
  },
  {
    key: "enableBanner",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用普通Banner"
  },
  {
    key: "bannerContent",
    value: "",
    type: "string",
    group: "feature",
    description: "Banner内容"
  },
  {
    key: "bannerStyle",
    value: "info",
    type: "string",
    group: "feature",
    description: "Banner样式"
  },
  {
    key: "enableCarousel",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用轮播"
  },
  // {
  //   key: "carouselItems",
  //   value: "[]",
  //   type: "json",
  //   group: "feature",
  //   description: "轮播项目"
  // },
  {
    key: "carouselImageStates",
    value: "[true,true,true,true,true,true]",
    type: "json",
    group: "feature",
    description: "轮播图片显示状态"
  },
  {
    key: "carouselImages",
    value: "",
    type: "string",
    group: "feature",
    description: "轮播图片"
  },
  {
    key: "carouselImageHyperlinks",
    value: "https://maiju.tech|https://maiju.tech|https://maiju.tech|https://maiju.tech|https://maiju.tech|https://maiju.tech",
    type: "json",
    group: "feature",
    description: "轮播图片跳转链接"
  },
  {
    key: "enableTopBanner",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用顶部通知Banner"
  },
  {
    key: "topBannerTitle",
    value: "MagicNav 1.0 Launched",
    type: "string",
    group: "feature",
    description: "Banner标题"
  },
  {
    key: "topBannerDescription",
    value: "A bookmark manager that helps you collect, organize, and share your favorite websites.",
    type: "string",
    group: "feature",
    description: "Banner描述"
  },
  {
    key: "topBannerButtonText",
    value: "Learn More",
    type: "string",
    group: "feature",
    description: "Banner按钮文本"
  },
  {
    key: "topBannerButtonLink",
    value: "https://github.com/Qyet/MagicNav  ",
    type: "string",
    group: "feature",
    description: "Banner按钮链接"
  },
  {
    key: "sidebarAdsTitle",
    value: "Organize Your Bookmarks",
    type: "string",
    group: "feature",
    description: "侧边栏广告标题"
  },
  {
    key: "sidebarAdsDescription",
    value: "MagicNav helps you collect, organize and share your favorite websites in a beautiful way",
    type: "string",
    group: "feature",
    description: "侧边栏广告描述"
  },
  {
    key: "sidebarAdsImageUrl",
    value: "/assets/spaces-preview.png",
    type: "string",
    group: "feature",
    description: "侧边栏广告图片"
  },
  {
    key: "sidebarAdsButtonText",
    value: "Get Started",
    type: "string",
    group: "feature",
    description: "侧边栏广告按钮文本"
  },
  {
    key: "sidebarAdsButtonUrl",
    value: "https://github.com/Qyet/MagicNav",
    type: "string",
    group: "feature",
    description: "侧边栏广告按钮链接"
  },
  // 导航菜单设置
  {
    key: "navigationMenu",
    value: JSON.stringify([
      {
        "id": "home",
        "name": "Home",
        "url": "https://maiju.tech",
        "target": "_blank",
        "enabled": true,
        "sortOrder": 1
      },
      {
        "id": "docs",
        "name": "📗 Docs",
        "url": "https://maiju.tech",
        "target": "_blank",
        "enabled": true,
        "sortOrder": 2
      },
      {
        "id": "github",
        "name": "Github",
        "url": "https://github.com/Qyet/MagicNav",
        "target": "_blank",
        "enabled": true,
        "sortOrder": 3
      }
    ]),
    type: "json",
    group: "feature",
    description: "导航菜单配置"
  }
];

export const defaultImages = [
  {
    name: "logo.png",
    image: "/default-images/logo.png",
    type: "default",
    settingKeys: [
      {
        key: "logoUrl",
      },
    ],
  },
  {
    name: "favicon.ico",
    image: "/default-images/favicon.ico",
    type: "default",
    settingKeys: [
      {
        key: "faviconUrl",
      },
    ],
  },
  {
    name: "og-image.png",
    image: "/default-images/og-image.png",
    type: "default",
    settingKeys: [
      {
        key: "ogImage",
      },
    ],
  },
  {
    name: "spaces-preview.png",
    image: "/default-images/spaces-preview.png",
    type: "default",
    settingKeys: [
      {
        key: "sidebarAdsImageUrl",
      },
    ],
  },
  {
    name: "carousel-images",
    images: [
      "/default-images/carousel-1.jpg",
      "/default-images/carousel-2.jpg", 
      "/default-images/carousel-3.jpg",
      "/default-images/carousel-4.jpg",
      "/default-images/carousel-5.jpg",
      "/default-images/carousel-6.jpg"
    ],
    type: "default",
    settingKeys: [
      {
        key: "carouselImages",
      },
    ],
  }
];
