import { useSettings } from "@/hooks/use-settings";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Footer() {
  const { settings } = useSettings('basic');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // 检查是否为图片URL
  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  // 关闭灯箱
  const closeLightbox = () => {
    setLightboxImage(null);
  };

  // 处理微信点击
  const handleWeChatClick = (url: string) => {
    if (isImageUrl(url)) {
      setLightboxImage(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const socialLinks = [
    {
      key: 'weixinUrl',
      icon: 'ri-wechat-fill',
      label: 'WeChat'
    },
    {
      key: 'githubUrl',
      icon: 'ri-github-fill',
      label: 'GitHub'
    },
    {
      key: 'twitterUrl',
      icon: 'ri-twitter-x-fill',
      label: 'Twitter'
    },
    {
      key: 'discordUrl',
      icon: 'ri-discord-fill',
      label: 'Discord'
    },
    {
      key: 'youtubeUrl',
      icon: 'ri-youtube-fill',
      label: 'YouTube'
    }
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* 左侧 Powered by 信息，根据设置显示 */}
          {settings.showPoweredBy === "true" && (
            <div className="text-sm text-muted-foreground order-first md:order-none flex items-center gap-1 min-w-0 lg:min-w-[200px] justify-center md:justify-start">
              <Image src="/logo.svg" alt="MagicNav Logo" width={20} height={20} className="h-5 w-5" />
              Powered by{' '}
              <Link
                href="https://maijukeji.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <span className="text-[#ff908c] group-hover:text-[#FA6262] transition-colors">Magic</span>
                <span className="text-[#6F76A8] group-hover:text-[#333a6a] transition-colors">Nav</span>
              </Link>
            </div>
          )}

          {/* 中间版权信息，支持HTML标签 */}
          <div className="text-sm text-muted-foreground text-center md:text-left flex items-center justify-center lg:justify-start">
            <span dangerouslySetInnerHTML={{ __html: settings.copyrightText }}></span>
          </div>

          {/* 右侧社交媒体链接 */}
          <div className="flex items-center space-x-4">
            {socialLinks.map(({ key, icon, label }) => {
              const url = settings[key];
              
              return url && (
                <div key={key} className="relative group">
                  {key === 'weixinUrl' ? (
                    <button
                      onClick={() => handleWeChatClick(settings[key])}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={label}
                    >
                      <i className={`${icon} h-6 w-6`} />
                    </button>
                  ) : (
                    <Link
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={label}
                    >
                      <i className={`${icon} h-6 w-6`} />
                    </Link>
                  )}
                  
                  {/* 微信预览悬停显示 */}
                  {key === 'weixinUrl' && isImageUrl(settings[key]) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible z-50">
                      <div className="relative w-[150px] h-[150px] flex items-center justify-center bg-gray-50">
                        <Image
                          src={settings[key]}
                          alt="WeChat QR Code"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      {/* 箭头 */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 灯箱模态框 */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <Image
              src={lightboxImage}
              alt="WeChat QR Code Large Preview"
              width={400}
              height={400}
              className="object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeLightbox}
              className="absolute -top-2 -right-2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white hover:text-gray-200 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </footer>
  );
} 