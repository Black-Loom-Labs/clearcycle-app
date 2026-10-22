import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { allPosts } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: "Blog — Claims Intelligence & RCM for Indian Hospitals",
  description:
    "Insights on insurance claim denials, ICD-10 coding, TPA behaviour, NHCX compliance, and revenue cycle management for Indian private hospitals.",
  alternates: { canonical: "https://clearcycle.in/blog" },
  openGraph: {
    title: "ClearCycle Blog — Claims Intelligence for Indian Hospitals",
    description:
      "Insights on insurance claim denials, ICD-10 coding, TPA behaviour, NHCX compliance, and RCM automation.",
    url: "https://clearcycle.in/blog",
  },
}

export default function BlogIndex() {
  return (
    <>
      <MarketingNav />
      <main>
        <section className="bg-[#0F1F3D] px-4 py-20 text-center sm:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              The ClearCycle Blog
            </p>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Claims intelligence for Indian hospitals
            </h1>
            <p className="mt-4 text-base text-white/60">
              Data-driven insights on TPA behaviour, medical coding, denial patterns, and the future
              of health insurance in India.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {allPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-border p-6 hover:border-[#1E6BFF]/40 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1E6BFF]">
                    {post.category}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold leading-snug group-hover:text-[#1E6BFF] transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <p className="mt-4 text-xs text-muted-foreground">{post.date} · {post.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  )
}
