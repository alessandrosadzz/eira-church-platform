'use client';

// src/components/ThemeInitializer.tsx
import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

export function ThemeInitializer() {
  const { temaAtivo, bordaAtiva, fonteAtiva, modoCor } = useAdminStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('eira_theme') || temaAtivo || 'eira-signature';
      const savedBorder = localStorage.getItem('eira_border') || bordaAtiva || 'balanced';
      const savedFont = localStorage.getItem('eira_font') || fonteAtiva || 'manrope';
      const savedMode = localStorage.getItem('eira_color_mode') || modoCor || 'light';

      document.documentElement.setAttribute('data-theme', savedTheme);
      document.documentElement.setAttribute('data-border', savedBorder);
      document.documentElement.setAttribute('data-font', savedFont);
      document.documentElement.setAttribute('data-mode', savedMode);

      if (savedMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Fallback gracioso se localStorage estiver bloqueado
      document.documentElement.setAttribute('data-theme', 'eira-signature');
      document.documentElement.setAttribute('data-border', 'balanced');
      document.documentElement.setAttribute('data-font', 'manrope');
      document.documentElement.setAttribute('data-mode', 'light');
    }
  }, [temaAtivo, bordaAtiva, fonteAtiva, modoCor]);

  return null;
}
