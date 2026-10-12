import { MetadataRoute } from 'next'
import { getSortedPostsData, getTopicsWithCounts } from '@/lib/posts'
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

    const topicUrls = getTopicsWithCounts().map((topic) => ({
        url: `${baseUrl}/android/topics/${topic.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
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
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/android/topics`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        ...topicUrls,
        ...appUrls,
        ...notesUrls,
    ]
}
