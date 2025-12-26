'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { Plus, Trash2, MoveUp, MoveDown, MoreHorizontal } from 'lucide-react';
import { AdminHeader } from '@/components/admin/header';
import { revalidateData } from '@/actions/revalidate-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationMenuItem {
  id: string;
  name: string;
  url: string;
  target: string;
  enabled: boolean;
  sortOrder: number;
}

const NavigationSettings = () => {
  const [navigationMenu, setNavigationMenu] = useState<NavigationMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings?group=feature');
        if (response.ok) {
          const settings = await response.json();
          if (settings.navigationMenu) {
            const navMenu = JSON.parse(settings.navigationMenu);
            setNavigationMenu(navMenu);
          }
        }
      } catch (error) {
        console.error('Failed to fetch navigation menu settings:', error);
        toast.error('Failed to fetch navigation menu settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save settings to API
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          navigationMenu: JSON.stringify(navigationMenu),
        }),
      });

      if (response.ok) {
        toast.success('Navigation menu settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save navigation menu settings:', error);
      toast.error('Failed to save navigation menu settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new menu item
  const addMenuItem = () => {
    const newItem: NavigationMenuItem = {
      id: `item-${Date.now()}`,
      name: 'New Menu Item',
      url: '#',
      target: '_self',
      enabled: true,
      sortOrder: navigationMenu.length + 1,
    };
    setNavigationMenu([...navigationMenu, newItem]);
  };

  // Remove menu item
  const removeMenuItem = (id: string) => {
    setNavigationMenu(navigationMenu.filter(item => item.id !== id));
  };

  // Update menu item
  const updateMenuItem = (id: string, updates: Partial<NavigationMenuItem>) => {
    setNavigationMenu(navigationMenu.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Move menu item up
  const moveItemUp = (index: number) => {
    if (index > 0) {
      const newMenu = [...navigationMenu];
      const temp = newMenu[index];
      newMenu[index] = newMenu[index - 1];
      newMenu[index - 1] = temp;
      // Update sortOrder
      setNavigationMenu(newMenu.map((item, i) => ({ ...item, sortOrder: i + 1 })));
    }
  };

  // Move menu item down
  const moveItemDown = (index: number) => {
    if (index < navigationMenu.length - 1) {
      const newMenu = [...navigationMenu];
      const temp = newMenu[index];
      newMenu[index] = newMenu[index + 1];
      newMenu[index + 1] = temp;
      // Update sortOrder
      setNavigationMenu(newMenu.map((item, i) => ({ ...item, sortOrder: i + 1 })));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#fa6262]"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#f9f9f9]">
      <AdminHeader title="Navigation Menu Settings" />

      <div className="mx-auto px-4 py-12 bg-[#f9f9f9]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-normal">
              Navigation Menu
            </p>
            <Card className="border bg-white">
              <CardHeader className="border-b">
                <CardTitle>Navigation Menu Configuration</CardTitle>
                <CardDescription>Add, edit, and reorder navigation menu items displayed in the header</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {navigationMenu.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[35%] min-w-[120px]">Item name</TableHead>
                          <TableHead className="w-[45%] min-w-[120px]">URL</TableHead>
                          <TableHead className="w-[10%] min-w-[150px]">Open in New Tab</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {navigationMenu.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Input
                                id={`name-${item.id}`}
                                placeholder="Home"
                                value={item.name}
                                onChange={(e) => updateMenuItem(item.id, { name: e.target.value })}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                id={`url-${item.id}`}
                                placeholder="/"
                                value={item.url}
                                onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                id={`target-${item.id}`}
                                checked={item.target === '_blank'}
                                onCheckedChange={(checked) => updateMenuItem(item.id, { target: checked ? '_blank' : '_self' })}
                              />
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => moveItemUp(index)}
                                    disabled={index === 0}
                                    className="flex items-center gap-2"
                                  >
                                    <MoveUp className="h-4 w-4" />
                                    Move Up
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => moveItemDown(index)}
                                    disabled={index === navigationMenu.length - 1}
                                    className="flex items-center gap-2"
                                  >
                                    <MoveDown className="h-4 w-4" />
                                    Move Down
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => removeMenuItem(item.id)}
                                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No menu items found. Click "Add Menu Item" to get started.</p>
                  </div>
                )}

                <div className="pt-6">
                  <Button
                    variant="outline"
                    onClick={addMenuItem}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-6">
                <div className="flex justify-end w-full">
                  <Button
                    onClick={saveSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSettings;
