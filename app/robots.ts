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
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'OAI-SearchBot',
                    'PerplexityBot',
                    'ClaudeBot',
                    'Claude-User',
                    'anthropic-ai',
                    'Google-Extended',
                    'GoogleOther',
                    'Applebot-Extended'
                ],
                allow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
