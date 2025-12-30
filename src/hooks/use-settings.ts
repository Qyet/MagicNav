import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Setting {
  value: string;
  type: string;
  group: string;
  description?: string;
}

export function useSettings(group?: string) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // 加载设置
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings${group ? `?group=${group}` : ''}`);
      if (!response.ok) throw new Error('Load settings failed');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Load settings failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    loadSettings();
  }, [group, loadSettings]);

  return {
    settings,
    loading,
    loadSettings
  };
} 