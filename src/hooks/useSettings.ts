import { useState, useEffect } from 'react';
import { type BusinessSettings, DEFAULT_SETTINGS } from '../types/settings';

let cachedSettings: BusinessSettings | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedSettings) return;

    let mounted = true;

    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && mounted) {
          cachedSettings = data.settings;
          setSettings(data.settings);
        }
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return { settings, loading, error };
}
