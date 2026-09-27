import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/news', '/news/*'],
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/api',
          '/favorites',
          '/search',
        ],
      },
    ],
    sitemap: [
      'https://www.myscore24.com/sitemap.xml',
      'https://www.myscore24.com/news-sitemap.xml',
    ],
  }
}
