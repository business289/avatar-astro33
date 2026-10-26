import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import SectionContainer from "@/components/SectionContainer";
import { articleReadMinutes, formatPostDate, getArticleBySlug } from "@/data/blogArticles";

const BlogArticle = () => {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);

  useEffect(() => {
    if (!article) return;
    const previous = document.title;
    document.title = `${article.title} | Astro Blog`;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", article.excerpt);
    return () => {
      document.title = previous;
      if (meta && prevDesc !== null) meta.setAttribute("content", prevDesc);
    };
  }, [article]);

  if (!article) {
    return (
      <div className="relative z-10 min-h-screen pt-28 pb-16">
        <SectionContainer className="max-w-[720px] text-center">
          <h1 className="mb-3 font-heading text-3xl text-white">Article not found</h1>
          <p className="mb-6 font-ui text-white/60">This article does not exist or is not published.</p>
          <Link to="/blog" className="font-ui font-semibold text-[#C7A46A] hover:underline">
            Back to all articles
          </Link>
        </SectionContainer>
      </div>
    );
  }

  return (
    <article className="relative z-10 min-h-screen pt-28 pb-16">
      <SectionContainer className="max-w-[820px]">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-2 font-ui text-sm text-white/60 hover:text-[#C7A46A]">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <p className="mb-3 font-ui text-xs font-semibold uppercase tracking-[0.25em] text-[#C7A46A]">{article.category}</p>
        <h1 className="mb-4 font-heading text-3xl font-semibold normal-case leading-[1.2] text-white md:text-4xl lg:text-[2.6rem]">
          {article.title}
        </h1>
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 font-ui text-sm text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.date}>{formatPostDate(article.date)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {articleReadMinutes(article)} min read
          </span>
        </div>

        <img
          src={article.image}
          alt={article.imageAlt}
          width={800}
          height={450}
          className="mb-8 aspect-video w-full rounded-2xl border border-white/10 object-cover"
          style={{ objectPosition: `50% ${article.imageFocus ?? 50}%` }}
        />

        <div className="space-y-5 font-ui text-[1.0625rem] leading-[1.75] text-white/75">
          {article.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}

          {article.sections.map((s) => (
            <section key={s.heading} className="space-y-4 pt-3">
              <h2 className="font-heading text-2xl font-semibold normal-case text-white">{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.bullets && (
                <ul className="list-disc space-y-2 pl-6 marker:text-[#C7A46A]">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="space-y-4 pt-3">
            <h2 className="font-heading text-2xl font-semibold normal-case text-white">In short</h2>
            {article.conclusion.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        </div>

        <aside className="mt-10 rounded-2xl border border-[#C7A46A]/25 bg-white/[0.03] p-5">
          <h2 className="mb-3 font-heading text-lg font-semibold normal-case text-white">Continue on Astro</h2>
          <ul className="space-y-2 font-ui">
            {article.related.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex items-center gap-2 text-[#C7A46A] hover:underline">
                  {l.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </SectionContainer>
    </article>
  );
};

export default BlogArticle;
