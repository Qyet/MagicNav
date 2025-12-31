import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";

  interface Settings {
    weixinUrl?: string;
    behanceUrl?: string;
    dribbbleUrl?: string;
    pinterestUrl?: string;
    githubUrl?: string;
    discordUrl?: string;
    twitterUrl?: string;
    telegramUrl?: string;
    linkedinUrl?: string;
    youtubeUrl?: string;
    bilibiliUrl?: string;
    weiboUrl?: string;
    zhihuUrl?: string;
    [key: string]: string | undefined;
  }

  const SocialMediaCard = ({
    settings,
    handleChange,
  }: {
    settings: Settings;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    const socialLinks = [
      { id: "weixinUrl", label: "WeChat Official Account Link", placeholder: "WeChat Official Account Link", description: "Supports official account QR code image (150px*150px)" },
      {
        id: "behanceUrl",
        label: "Behance URL",
        placeholder: "https://behance.net/yourusername",
      },
      {
        id: "dribbbleUrl",
        label: "Dribbble URL",
        placeholder: "https://dribbble.com/yourusername",
      },
      {
        id: "pinterestUrl",
        label: "Pinterest URL",
        placeholder: "https://pinterest.com/yourusername",
      },
      {
        id: "githubUrl",
        label: "GitHub URL",
        placeholder: "https://github.com/yourusername",
      },
      {
        id: "discordUrl",
        label: "Discord URL",
        placeholder: "https://discord.gg/yourserver",
      },
      {
        id: "twitterUrl",
        label: "Twitter/X URL",
        placeholder: "https://twitter.com/yourusername",
      },
      {
        id: "telegramUrl",
        label: "Telegram URL",
        placeholder: "https://t.me/yourusername",
      },
      {
        id: "linkedinUrl",
        label: "LinkedIn URL",
        placeholder: "https://linkedin.com/in/yourprofile",
      },
      {
        id: "youtubeUrl",
        label: "YouTube Channel Link",
        placeholder: "https://youtube.com/c/yourchannel",
      },
      {
        id: "bilibiliUrl",
        label: "Bilibili Homepage Link",
        placeholder: "https://space.bilibili.com/yourpage",
      },
      {
        id: "weiboUrl",
        label: "Weibo Homepage Link",
        placeholder: "https://weibo.com/yourpage",
      },
      {
        id: "zhihuUrl",
        label: "Zhihu Homepage Link",
        placeholder: "https://zhihu.com/people/yourpage",
      },
    ];
  
    return (
      <Card className="border bg-white">
        <CardHeader className="border-b">
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Set the social media links displayed in the footer of your website</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          {socialLinks.map(({ id, label, placeholder, description }) => (
            <div key={id} className="grid gap-2">
              <Label htmlFor={id}>{label}</Label>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              <Input
                id={id}
                name={id}
                value={settings[id] || ""}
                onChange={handleChange}
                placeholder={placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  export default SocialMediaCard;