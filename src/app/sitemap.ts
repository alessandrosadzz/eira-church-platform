// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { SEED_EVENTOS } from '../lib/supabase';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventos.eirachurch.com.br';

  const rotasEventos: MetadataRoute.Sitemap = SEED_EVENTOS.map((evento) => ({
    url: `${baseUrl}/evento/${evento.slug}`,
    lastModified: new Date(evento.updated_at || evento.created_at),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...rotasEventos,
  ];
}
