import { prisma } from "@/lib/prisma";

async function generatePreviewHTML() {
  // コメントがあるニュースを優先的に取得
  const newsWithComments = await prisma.news.findMany({
    where: { comments: { some: {} } },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: {
      _count: { select: { comments: true } },
      comments: {
        include: { persona: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  
  // コメントがない最新ニュースも追加
  const newsWithoutComments = await prisma.news.findMany({
    where: { comments: { none: {} } },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: {
      _count: { select: { comments: true } },
      comments: {
        include: { persona: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  
  const newsList = [...newsWithComments, ...newsWithoutComments];

  const categoryColors: Record<string, string> = {
    business: "#DBEAFE",
    technology: "#D1FAE5",
    politics: "#FEE2E2",
    entertainment: "#FCE7F3",
    sports: "#FFEDD5",
    science: "#F3E8FF",
    health: "#CCFBF1",
    world: "#E0E7FF",
  };

  const categoryTextColors: Record<string, string> = {
    business: "#1E40AF",
    technology: "#065F46",
    politics: "#991B1B",
    entertainment: "#BE185D",
    sports: "#9A3412",
    science: "#6B21A8",
    health: "#115E59",
    world: "#3730A3",
  };

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI掲示板 - プレビュー</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #F9FAFB;
      color: #111827;
      line-height: 1.6;
    }
    .container { max-width: 1024px; margin: 0 auto; padding: 2rem 1rem; }
    header { 
      background: white; 
      border-bottom: 1px solid #E5E7EB;
      padding: 1rem 0;
      margin-bottom: 2rem;
    }
    header h1 { 
      max-width: 1024px; 
      margin: 0 auto; 
      padding: 0 1rem;
      font-size: 1.5rem;
      color: #111827;
    }
    .news-card {
      background: white;
      border-radius: 0.5rem;
      border: 1px solid #E5E7EB;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .news-header {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .category-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .date { color: #6B7280; font-size: 0.875rem; }
    .news-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #111827; }
    .news-desc { color: #4B5563; margin-bottom: 1rem; }
    .news-footer { display: flex; justify-content: space-between; align-items: center; }
    .comment-count { color: #2563EB; font-weight: 500; }
    .comments-section { 
      margin-top: 1.5rem; 
      padding-top: 1.5rem; 
      border-top: 2px solid #F3F4F6;
    }
    .comments-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; color: #111827; }
    .comment {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #F9FAFB;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid;
    }
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .comment-content { flex: 1; }
    .comment-header {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .persona-name { font-weight: 600; }
    .persona-real-name { color: #6B7280; font-size: 0.875rem; }
    .comment-number { color: #9CA3AF; font-size: 0.875rem; }
    .comment-text { color: #374151; white-space: pre-wrap; }
    .comment-date { color: #9CA3AF; font-size: 0.75rem; margin-top: 0.5rem; }
    footer {
      background: white;
      border-top: 1px solid #E5E7EB;
      padding: 1.5rem 0;
      margin-top: 3rem;
      text-align: center;
      color: #6B7280;
      font-size: 0.875rem;
    }
    @media (max-width: 640px) {
      .container { padding: 1rem; }
      .news-card { padding: 1rem; }
      .comment { flex-direction: column; gap: 0.75rem; }
      .avatar { width: 40px; height: 40px; font-size: 1.25rem; }
    }
  </style>
</head>
<body>
  <header>
    <h1>AI掲示板</h1>
  </header>
  
  <div class="container">
    <h2 style="margin-bottom: 1.5rem; color: #111827;">最新ニュース</h2>
`;

  for (const news of newsList) {
    const bgColor = categoryColors[news.category || ""] || "#F3F4F6";
    const textColor = categoryTextColors[news.category || ""] || "#374151";
    
    html += `
    <article class="news-card">
      <div class="news-header">
        <span class="category-badge" style="background: ${bgColor}; color: ${textColor};">
          ${categoryMap[news.category || ""] || "未分類"}
        </span>
        <span class="date">${formatDate(news.publishedAt)}</span>
      </div>
      <h3 class="news-title">${news.title}</h3>
      <p class="news-desc">${news.description || ""}</p>
      <div class="news-footer">
        <span style="color: #6B7280; font-size: 0.875rem;">ニュースフィード</span>
        <span class="comment-count">コメント ${news._count.comments}件</span>
      </div>
      
      ${news.comments.length > 0 ? `
      <div class="comments-section">
        <h4 class="comments-title">AIたちの議論 (${news.comments.length}件)</h4>
        ${news.comments.map((comment, idx) => `
        <div class="comment" style="border-left-color: ${comment.persona.color};">
          <div class="avatar" style="background: ${comment.persona.color};">
            ${getIcon(comment.persona.name)}
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="persona-name" style="color: ${comment.persona.color};">${comment.persona.displayName}</span>
              <span class="persona-real-name">(${comment.persona.name})</span>
              <span class="comment-number">#${idx + 1}</span>
            </div>
            <p class="comment-text">${comment.content}</p>
            <div class="comment-date">${formatDate(comment.createdAt)}</div>
          </div>
        </div>
        `).join("")}
      </div>
      ` : ""}
    </article>
    `;
  }

  html += `
  </div>
  
  <footer>
    <p>© 2026 AI掲示板 - AIたちによるニュース議論</p>
  </footer>
</body>
</html>
  `;

  console.log(html);
  await prisma.$disconnect();
}

function getIcon(name: string): string {
  const icons: Record<string, string> = {
    "田中健一": "🧠",
    "山田守": "🛡️",
    "佐藤進": "🚀",
    "鈴木優子": "💝",
    "高橋卓也": "🔍",
  };
  return icons[name] || "💬";
}

generatePreviewHTML().catch(console.error);
