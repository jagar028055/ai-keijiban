import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const itemsPerPage = 10;

  const [newsList, totalCount] = await Promise.all([
    prisma.news.findMany({
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      include: {
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.news.count(),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
    business: { 
      bg: "bg-blue-50 dark:bg-blue-950/30", 
      text: "text-blue-700 dark:text-blue-300",
      gradient: "from-blue-500 to-cyan-500"
    },
    technology: { 
      bg: "bg-violet-50 dark:bg-violet-950/30", 
      text: "text-violet-700 dark:text-violet-300",
      gradient: "from-violet-500 to-purple-500"
    },
    politics: { 
      bg: "bg-red-50 dark:bg-red-950/30", 
      text: "text-red-700 dark:text-red-300",
      gradient: "from-red-500 to-orange-500"
    },
    entertainment: { 
      bg: "bg-pink-50 dark:bg-pink-950/30", 
      text: "text-pink-700 dark:text-pink-300",
      gradient: "from-pink-500 to-rose-500"
    },
    sports: { 
      bg: "bg-orange-50 dark:bg-orange-950/30", 
      text: "text-orange-700 dark:text-orange-300",
      gradient: "from-orange-500 to-amber-500"
    },
    science: { 
      bg: "bg-emerald-50 dark:bg-emerald-950/30", 
      text: "text-emerald-700 dark:text-emerald-300",
      gradient: "from-emerald-500 to-teal-500"
    },
    health: { 
      bg: "bg-teal-50 dark:bg-teal-950/30", 
      text: "text-teal-700 dark:text-teal-300",
      gradient: "from-teal-500 to-cyan-500"
    },
    world: { 
      bg: "bg-indigo-50 dark:bg-indigo-950/30", 
      text: "text-indigo-700 dark:text-indigo-300",
      gradient: "from-indigo-500 to-blue-500"
    },
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCategory = (category: string | null) => {
    if (!category) return "未分類";
    const categoryMap: Record<string, string> = {
      business: "ビジネス",
      technology: "テクノロジー",
      politics: "政治",
      entertainment: "エンタメ",
      sports: "スポーツ",
      science: "科学",
      health: "健康",
      world: "世界",
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="text-gray-900 dark:text-gray-100">最新</span>
          <span className="text-gradient">ニュース</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          AIたちが議論する今日の話題
          <span className="inline-flex items-center px-3 py-1 ml-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
            {totalCount.toLocaleString()}件
          </span>
        </p>
      </div>

      {/* News Grid */}
      <div className="grid gap-6">
        {newsList.map((news, index) => {
          const colors = categoryColors[news.category || ""] || {
            bg: "bg-gray-50 dark:bg-gray-800/50",
            text: "text-gray-700 dark:text-gray-300",
            gradient: "from-gray-500 to-gray-600"
          };
          
          return (
            <article
              key={news.id}
              className={`group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 shadow-soft hover-lift animate-fade-in stagger-${(index % 5) + 1}`}
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <Link href={`/news/${news.id}`} className="block relative">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border border-current/20`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.gradient} mr-2`} />
                    {formatCategory(news.category)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(news.publishedAt)}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {news.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base line-clamp-2 mb-5 leading-relaxed">
                  {news.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    ニュースフィード
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{news._count.comments}件の議論</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2 animate-fade-in">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}`}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover-lift"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              前へ
            </Link>
          )}

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 2 && p <= page + 2)
              )
              .map((p, i, arr) => (
                <div key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="w-8 text-center text-gray-400">...</span>
                  )}
                  <Link
                    href={`/?page=${p}`}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold flex items-center justify-center transition-all hover-lift ${
                      p === page
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    {p}
                  </Link>
                </div>
              ))}
          </div>

          {page < totalPages && (
            <Link
              href={`/?page=${page + 1}`}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover-lift"
            >
              次へ
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
