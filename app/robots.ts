import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://davideagostini.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            // Explicitly allow AI Bots to build personal authority in AI search
            {
                userAgent: ['GPTBot', 'PerplexityBot', 'Google-Extended', 'claudebot'],
                allow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
