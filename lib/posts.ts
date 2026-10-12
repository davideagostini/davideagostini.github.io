import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { getTopic, topics } from './topics';

const postsDirectory = path.join(process.cwd(), 'content/android');

export function getSortedPostsData() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  // Filter out non-markdown files and files starting with underscore (templates/drafts)
  const filteredFileNames = fileNames.filter(fileName => 
    fileName.endsWith('.md') && !fileName.startsWith('_')
  );

  const allPostsData = filteredFileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    const data = matterResult.data as { date: string; title: string; description: string; tags: string[] };
    // Fail the build on a tag that is not a curated topic.
    data.tags.forEach(getTopic);

    return {
      id,
      ...data,
    };
  });
  
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostsByTopic(slug: string) {
  return getSortedPostsData().filter((post) => post.tags.includes(slug));
}

// Topics that have at least one post, with their post count, in lib/topics.ts order.
export function getTopicsWithCounts() {
  const posts = getSortedPostsData();
  return topics
    .map((topic) => ({ ...topic, count: posts.filter((post) => post.tags.includes(topic.slug)).length }))
    .filter((topic) => topic.count > 0);
}

export function getAllPostIds() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  const filteredFileNames = fileNames.filter(fileName => 
    fileName.endsWith('.md') && !fileName.startsWith('_')
  );

  return filteredFileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export function getPostFrontmatter(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    id,
    ...(matterResult.data as { date: string; title: string; description: string; tags: string[] }),
  };
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  if (!fs.existsSync(fullPath)) return null;
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCode, {
      theme: 'github-dark-dimmed',
      keepBackground: true,
      onVisitLine(node: { children: unknown[] }) {
        if (node.children.length === 0) {
          node.children = [{ type: 'text', value: ' ' }];
        }
      },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string; description: string; tags: string[] }),
  };
}
