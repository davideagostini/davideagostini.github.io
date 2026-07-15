import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'
import { apps } from '@/lib/apps'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://davideagostini.com'
    const posts = getSortedPostsData()

    const notesUrls = posts.map((post) => ({
        url: `${baseUrl}/android/${post.id}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const appUrls = apps.map((app) => ({
        url: `${baseUrl}/apps/${app.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/android`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/apps`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        ...appUrls,
        ...notesUrls,
    ]
}
