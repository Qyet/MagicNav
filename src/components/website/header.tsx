"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Settings, ChevronDown, MoreHorizontal, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CreateBookmarkDialogGlobal from "@/components/bookmark/CreateBookmarkDialogGlobal";
import {  useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface Collection {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  description?: string;
}

interface HeaderProps {
  selectedCollectionId?: string;
  currentFolderId?: string | null;
  onBookmarkAdded?: () => void;
  onCollectionChange?: (id: string) => void;
}

interface NavigationMenuItem {
  id: string;
  name: string;
  url: string;
  target: string;
  enabled: boolean;
  sortOrder: number;
}

export function Header({ 
  selectedCollectionId, 
  currentFolderId, 
  onBookmarkAdded,
  onCollectionChange 
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [navigationMenu, setNavigationMenu] = useState<NavigationMenuItem[]>([]);
  const [visibleMenuItems, setVisibleMenuItems] = useState<NavigationMenuItem[]>([]);
  const [hiddenMenuItems, setHiddenMenuItems] = useState<NavigationMenuItem[]>([]);
  const navRef = useRef<HTMLUListElement>(null);
  
  // 跟踪是否是移动端
  const [isMobile, setIsMobile] = useState(false);
  
  // 使用refs跟踪每个菜单项的元素和宽度
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  
  // 添加响应式处理：移动端折叠所有菜单
  useEffect(() => {
    // 初始检测
    setIsMobile(window.innerWidth < 768);
    
    // 监听窗口大小变化，更新移动端状态
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', updateIsMobile);
    
    return () => {
      window.removeEventListener('resize', updateIsMobile);
    };
  }, []);
  
  // 添加响应式处理：移动端折叠所有菜单
  useEffect(() => {
    // 获取所有导航菜单项
    const enabledItems = navigationMenu.filter(item => item.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
    
    // 定义移动端检测函数
    const isMobile = () => {
      return window.innerWidth < 768;
    };
    
    // 计算可见和隐藏的菜单项
    const calculateResponsiveMenu = () => {
      if (!enabledItems.length) {
        setVisibleMenuItems([]);
        setHiddenMenuItems([]);
        return;
      }
      
      // 移动端：只显示更多按钮，所有菜单项都隐藏
      if (isMobile()) {
        setVisibleMenuItems([]);
        setHiddenMenuItems(enabledItems);
        return;
      }
      
      // 桌面端：正常显示
      // 当菜单项数量 <= 5时，显示所有菜单项
      if (enabledItems.length <= 5) {
        setVisibleMenuItems(enabledItems);
        setHiddenMenuItems([]);
      } else {
        // 当菜单项数量 > 5时，显示前4个，其余隐藏
        setVisibleMenuItems(enabledItems.slice(0, 4));
        setHiddenMenuItems(enabledItems.slice(4));
      }
    };
    
    // 初始计算
    calculateResponsiveMenu();
    
    // 监听窗口大小变化
    const handleResize = () => {
      calculateResponsiveMenu();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigationMenu, collections]);

  // 获取collections列表
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // 如果用户已登录，获取所有Collections（包括私有）
        // 如果用户未登录，只获取公开Collections
        const url = session ? "/api/collections" : "/api/collections?publicOnly=true";
        const response = await fetch(url);
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("获取collections失败:", error);
      }
    };

    fetchCollections();
  }, [session]);

  // 获取导航菜单设置
  useEffect(() => {
    const fetchNavigationMenu = async () => {
      try {
        const response = await fetch("/api/settings?group=feature");
        if (response.ok) {
          const settings = await response.json();
          if (settings.navigationMenu) {
            const navMenu = JSON.parse(settings.navigationMenu);
            setNavigationMenu(navMenu);
          }
        }
      } catch (error) {
        console.error("获取导航菜单设置失败:", error);
      }
    };

    fetchNavigationMenu();
  }, []);

  const handleSuccess = async (newBookmarkFolderId?: string) => {
    setDialogOpen(false);
    
    if (
      (newBookmarkFolderId && newBookmarkFolderId === currentFolderId) || 
      (!newBookmarkFolderId && !currentFolderId)
    ) {
      if (onBookmarkAdded) {
        await onBookmarkAdded();
      }
    }
    
    const targetFolderId = newBookmarkFolderId || currentFolderId;
    
    if (targetFolderId && targetFolderId !== currentFolderId) {
      const currentSearchParams = new URLSearchParams(searchParams.toString());
      currentSearchParams.set('folderId', targetFolderId);
      router.push(`${pathname}?${currentSearchParams.toString()}`);
    }
  };

  // 处理collection切换
  const handleCollectionSelect = (collection: Collection) => {
    if (onCollectionChange) {
      onCollectionChange(collection.id);
    }
    
    // 更新URL参数
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    currentSearchParams.set('collection', collection.slug);
    router.push(`${pathname}?${currentSearchParams.toString()}`);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background">
      {/* 左侧：侧边栏触发器和导航栏 */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        
        {/* 导航栏 - 智能响应式设计 */}
        <nav aria-label="Main" data-orientation="horizontal" dir="ltr" className="relative z-10 flex flex-1 items-center justify-start">
          <div style={{ position: 'relative' }} className="w-full">
            <ul data-orientation="horizontal" className="group flex list-none items-center justify-start space-x-1" dir="ltr" ref={navRef}>
              {/* Collections下拉菜单 */}
              <li className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      id="radix-:r0:-trigger-radix-:r1:" 
                      className="group inline-flex h-10 w-max items-center justify-center rounded-full bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 group"
                    >
                      Collections
                      <ChevronDown width="15" height="15" className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start"
                    className="rounded-lg shadow-lg border bg-background min-w-[280px] max-w-[320px]"
                  >
                    {collections.map((collection) => (
                      <DropdownMenuItem
                        key={collection.id}
                        onClick={() => handleCollectionSelect(collection)}
                        className={`flex flex-col items-start p-3 rounded-xl w-full gap-0.5 ${
                          selectedCollectionId === collection.id ? "bg-accent/50" : ""
                        }`}
                      >
                        <div>
                          <span className="text-sm font-medium line-clamp-2 w-full">{collection.name}</span>
                        </div>
                        {collection.description && (
                          <div>
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {collection.description.length > 100 
                                ? `${collection.description.substring(0, 100)}...` 
                                : collection.description
                              }
                            </span>
                          </div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
              
              {/* 动态渲染可见的导航链接 */}
              {visibleMenuItems.map((item, index) => (
                <li key={item.id} className="flex-shrink-0">
                  <Button 
                    ref={(el) => {
                      // 确保ref数组有足够的空间
                      if (!itemRefs.current) {
                        itemRefs.current = [];
                      }
                      itemRefs.current[index] = el;
                    }}
                    variant="ghost" 
                    asChild
                    className="group inline-flex h-10 w-max items-center justify-center rounded-full bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    <Link href={item.url} target={item.target} rel="noopener">
                      {item.name}
                    </Link>
                  </Button>
                </li>
              ))}
              
              {/* 更多下拉菜单 - 隐藏的菜单项 */}
              {hiddenMenuItems.length > 0 && (
                <li className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="group inline-flex h-10 w-max items-center justify-center rounded-full bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 group"
                      >
                        {isMobile ? (
                          <Menu width="15" height="15" className="h-3 w-3" />
                        ) : (
                          <MoreHorizontal width="15" height="15" className="h-3 w-3" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end"
                      className="rounded-lg shadow-lg border bg-background min-w-[200px]"
                      style={isMobile ? ({
                        left: 0,
                        right: 0,
                        margin: '0 1rem',
                        maxWidth: 'calc(100vw - 2rem)',
                        width: 'calc(100vw - 2rem)'
                      } as React.CSSProperties) : {
                        minWidth: '200px'
                      }}
                    >
                      {hiddenMenuItems.map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <Link href={item.url} target={item.target} rel="noopener" className="w-full">
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>
      
      {/* 右侧操作按钮 - 右对齐 */}
      <div className="flex items-center gap-2 ml-auto">
        {session && (
          <>
            <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDialogOpen(true)}
          aria-label="New Bookmark"
        >
          <Plus className="h-4 w-4" />
        </Button>
          </>
        )}
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/collections" aria-label="Admin">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <CreateBookmarkDialogGlobal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultCollectionId={selectedCollectionId || ""}
        defaultFolderId={currentFolderId || undefined}
        onSuccess={handleSuccess}
      />
    </header>
  );
}