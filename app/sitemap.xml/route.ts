import { getPosts } from "@/sanity/lib/post/getPosts";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getPosts();

  const sitemapItems = posts.map((post: any) => {
    const communitySlug = post.subreddit?.slug?.current || post.subreddit?.slug || "";
    return `
  <url>
    <loc>${process.env.NEXT_PUBLIC_BASE_URL || "https://fairarena.com"}/c/${communitySlug}/post/${post._id}</loc>
    <lastmod>${post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join("");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_BASE_URL || "https://fairarena.com"}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_BASE_URL || "https://fairarena.com"}/popular</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_BASE_URL || "https://fairarena.com"}/hot</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${sitemapItems}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
