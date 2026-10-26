import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { allPosts, getPost } from "@/lib/blog-posts"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://clearcycle.in/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://clearcycle.in/blog/${slug}`,
      type: "article",
      publishedTime: post.isoDate,
      authors: ["ClearCycle"],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.isoDate,
    author: { "@type": "Organization", name: "ClearCycle", url: "https://clearcycle.in" },
    publisher: {
      "@type": "Organization",
      name: "ClearCycle",
      logo: { "@type": "ImageObject", url: "https://clearcycle.in/logo.svg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://clearcycle.in/blog/${slug}` },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <MarketingNav />
      <main>
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Link
            href="/blog"
            className="text-sm text-[#1E6BFF] hover:underline"
          >
            ← All articles
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#1E6BFF]">
            {post.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {post.date} · {post.readTime}
          </p>
          <div className="mt-10 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0F1F3D] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_p]:mb-4 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:text-[15px] [&_li]:leading-relaxed [&_li]:text-muted-foreground [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-[#F7F8FA] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_table]:w-full [&_table]:mb-4 [&_table]:text-sm [&_th]:text-left [&_th]:pb-2 [&_th]:font-semibold [&_th]:border-b [&_td]:py-2 [&_td]:border-b [&_td]:text-muted-foreground [&_a]:text-[#1E6BFF] [&_a]:underline">
            <post.Content />
          </div>
        </article>

        <section className="bg-[#EAF2FF] px-4 py-16 text-center sm:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              See ClearCycle in action at your hospital
            </h2>
            <p className="mt-3 text-muted-foreground">
              3-month free pilot. Full pipeline live within 2 weeks. No commitment.
            </p>
            <a
              href="/contact"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#1E6BFF] px-6 text-sm font-medium text-white hover:bg-[#1E6BFF]/90 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  )
}
