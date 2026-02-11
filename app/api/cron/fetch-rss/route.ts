import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { prisma } from '@/lib/prisma'

const parser = new Parser()

// Google News RSSのカテゴリーリスト
const RSS_FEEDS = [
  'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja', // ビジネス
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja', // テクノロジー
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja', // 科学
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja', // 政治
]

function extractCategory(url: string): string {
  if (url.includes('topics')) {
    if (url.includes('CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pWVXlnQVAB')) return 'ビジネス'
    if (url.includes('CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB')) return 'テクノロジー'
    if (url.includes('CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB')) return '科学'
    if (url.includes('CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB')) return '政治'
  }
  return '総合'
}

export async function GET(request: Request) {
  try {
    // Cron Secretの検証（Vercel Cronからのリクエストか確認）
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      fetched: 0,
      saved: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl)
        const category = extractCategory(feedUrl)

        for (const item of feed.items.slice(0, 10)) { // 各フィードから最大10件
          if (!item.title || !item.link) continue

          results.fetched++

          // URLで重複チェック
          const existing = await prisma.news.findUnique({
            where: { url: item.link },
          })

          if (existing) {
            results.skipped++
            continue
          }

          // 新規記事を保存
          await prisma.news.create({
            data: {
              title: item.title,
              url: item.link,
              description: item.contentSnippet || item.content || null,
              category: category,
              publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            },
          })

          results.saved++
        }
      } catch (error) {
        const errorMsg = `Failed to fetch ${feedUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`
        results.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `RSS取得完了: ${results.saved}件保存、${results.skipped}件スキップ`,
      results,
    })
  } catch (error) {
    console.error('RSS取得エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
