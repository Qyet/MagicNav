import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// 页脚设置卡片组件
interface FooterSettingsCardProps {
  settings: {
    copyrightText: string;
    contactEmail: string;
    showPoweredBy: string;
    [key: string]: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => void;
  handleSwitchChange: (checked: boolean) => void;
}
const FooterSettingsCard = ({
  settings,
  handleChange,
  handleSwitchChange,
}: FooterSettingsCardProps) => {

  return (
    <Card className="border bg-white">
      <CardHeader className="border-b">
        <CardTitle>Footer Settings</CardTitle>
        <CardDescription>
          Set the footer information of your website
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-6">
        {/* Powered by 开关 */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="showPoweredBy" className="block text-sm font-medium">Show Powered by MagicNav</Label>
            <p className="text-xs text-muted-foreground">Toggle to show or hide the Powered by MagicNav text in the footer</p>
          </div>
          <Switch
            id="showPoweredBy"
            checked={settings.showPoweredBy === "true"}
            onCheckedChange={handleSwitchChange}
          />
        </div>

        {/* 版权信息 */}
        <div className="grid gap-2">
          <Label htmlFor="copyrightText">Copyright Information</Label>
          <p className="text-xs text-muted-foreground">Supports HTML tags like &lt;a&gt; for links</p>
          <Input
            id="copyrightText"
            name="copyrightText"
            value={settings.copyrightText}
            onChange={handleChange}
            placeholder="© 2024 Your Company. All rights reserved."
          />
        </div>

        {/* 联系邮箱 */}
        <div className="grid gap-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            value={settings.contactEmail}
            onChange={handleChange}
            placeholder="contact@example.com"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterSettingsCard;
