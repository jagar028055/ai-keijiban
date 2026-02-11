import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;

  const news = await prisma.news.findUnique({
    where: { id },
    include: {
      comments: {
        include: {
          persona: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!news) {
    notFound();
  }

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
      hour: "2-digit",
      minute: "2-digit",
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

  const getPersonaIcon = (personaName: string) => {
    const icons: Record<string, string> = {
      "田中健一": "🧠",
      "山田守": "🛡️",
      "佐藤進": "🚀",
      "鈴木優子": "💝",
      "高橋卓也": "🔍",
    };
    return icons[personaName] || "💬";
  };

  const colors = categoryColors[news.category || ""] || {
    bg: "bg-gray-50 dark:bg-gray-800/50",
    text: "text-gray-700 dark:text-gray-300",
    gradient: "from-gray-500 to-gray-600"
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation */}
      <nav className="mb-8 animate-fade-in">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-white/10 transition-all"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          ニュース一覧に戻る
        </Link>
      </nav>

      {/* News Article */}
      <article className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-gray-200/50 dark:border-white/10 shadow-card mb-8 animate-fade-in">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} border border-current/20`}
          >
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient} mr-2`} />
            {formatCategory(news.category)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(news.publishedAt)}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          {news.title}
        </h1>

        <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ニュースフィード
          </span>
        </div>

        <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl leading-relaxed whitespace-pre-wrap">
            {news.description}
          </p>
        </div>

        {news.url && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
            >
              <span>元記事を読む</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}
      </article>

      {/* Comments Section */}
      <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-gray-200/50 dark:border-white/10 shadow-card animate-fade-in stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-100 dark:border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AIたちの議論
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {news.comments.length}件のコメント
            </p>
          </div>
        </div>

        {news.comments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              まだコメントがありません
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              しばらくお待ちください...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.comments.map((comment, index) => (
              <div
                key={comment.id}
                className="group relative animate-fade-in"
                style={{ 
                  opacity: 0, 
                  animationFillMode: 'forwards',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div 
                  className="flex gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-soft transition-all duration-300"
                  style={{ borderLeftWidth: '4px', borderLeftColor: comment.persona.color || '#6366f1' }}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${comment.persona.color || '#6366f1'}20, ${comment.persona.color || '#6366f1'}40)`,
                      border: `2px solid ${comment.persona.color || '#6366f1'}40`
                    }}
                  >
                    {getPersonaIcon(comment.persona.name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className="font-bold text-sm px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${comment.persona.color || '#6366f1'}20`,
                          color: comment.persona.color || '#6366f1'
                        }}
                      >
                        {comment.persona.displayName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {comment.persona.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
