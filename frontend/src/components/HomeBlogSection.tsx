import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { articleReadMinutes, formatPostDate, getPublishedArticles } from "@/data/blogArticles";
import SectionContainer from "./SectionContainer";

/** Homepage blog: the four newest published articles, newest first. */
const HomeBlogSection = () => {
  const posts = getPublishedArticles().slice(0, 4);

  return (
    <section className="relative z-10 w-full py-12 md:py-16" data-testid="home-blog">
      <SectionContainer>
        <div className="mb-8 flex flex-col gap-5 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-[0.25em] text-[#C7A46A]">
              Insights &amp; Stories
            </p>
            <h2 className="font-heading text-3xl font-semibold normal-case leading-[1.15] tracking-[0.02em] text-white sm:text-4xl md:text-[2.6rem]">
              Read from our <span className="text-[#C7A46A]">blog.</span>
            </h2>
          </div>

          <Link
            to="/blog"
            className="group inline-flex h-11 shrink-0 items-center gap-2 self-center rounded-full bg-[#C7A46A] px-6 font-ui text-sm font-semibold text-[#081426] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none sm:self-auto"
          >
            View all blogs
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-[#C7A46A]/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="aspect-video w-full overflow-hidden bg-[#0b1c3d]">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  width={800}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  style={{ objectPosition: `50% ${post.imageFocus ?? 50}%` }}
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="font-ui text-xs font-semibold uppercase tracking-wider text-[#C7A46A]">{post.category}</span>
                <h3 className="mb-2 mt-2 font-heading text-[1.05rem] font-semibold normal-case leading-snug text-white transition-colors group-hover:text-[#C7A46A]">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-3 font-ui text-sm leading-relaxed text-white/60">{post.excerpt}</p>
                <div className="mt-auto flex items-center gap-2 font-ui text-xs text-white/50">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{articleReadMinutes(post)} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};

export default HomeBlogSection;
