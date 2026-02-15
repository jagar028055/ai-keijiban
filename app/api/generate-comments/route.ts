import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// フォールバック対応の無料モデルリスト（優先順位順）
const FREE_MODELS = [
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B', priority: 1 }, // 日本語最強
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'NVIDIA Nemotron 3 Nano', priority: 2 }, // 安定
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee AI Trinity', priority: 3 }, // フォールバック
]

// レート制限対策: 1分あたり8リクエストまでなので、8秒間隔で実行
const RATE_LIMIT_DELAY_MS = 8000

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

// 指定時間待機する関数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 単一モデルでコメント生成を試みる
async function tryGenerateComment(
  model: string,
  prompt: string,
  apiKey: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ai-keijiban.vercel.app',
        'X-Title': 'AI Keijiban',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { 
        success: false, 
        error: `Model ${model}: ${response.status} - ${errorText}` 
      }
    }

    const data: OpenRouterResponse = await response.json()
    let content = data.choices[0]?.message?.content?.trim()
    
    // Remove quotes (「」) that AI sometimes adds
    if (content) {
      content = content.replace(/^[「"'](.+)[」"']$/s, '$1').trim()
    }
    
    if (content) {
      return { success: true, content }
    } else {
      return { success: false, error: `Model ${model}: Empty response` }
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// フォールバック付きコメント生成
async function generateCommentWithFallback(
  promptTemplate: string,
  title: string,
  description: string | null
): Promise<{ content: string; modelUsed: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }

  const prompt = promptTemplate
    .replace('{title}', title)
    .replace('{description}', description || '（概要なし）')

  // 優先順位順にモデルを試す
  for (const modelConfig of FREE_MODELS) {
    console.log(`Trying model: ${modelConfig.name} (${modelConfig.id})`)
    
    const result = await tryGenerateComment(modelConfig.id, prompt, apiKey)
    
    if (result.success && result.content) {
      console.log(`✓ Success with ${modelConfig.name}`)
      return { content: result.content, modelUsed: modelConfig.name }
    } else {
      console.log(`✗ Failed with ${modelConfig.name}: ${result.error}`)
      // 次のモデルへフォールバック
      continue
    }
  }

  // すべてのモデルが失敗
  throw new Error('All models failed to generate comment')
}

export async function POST(request: Request) {
  try {
    // 内部API認証
    const authHeader = request.headers.get('authorization')
    if (process.env.INTERNAL_SECRET && authHeader !== `Bearer ${process.env.INTERNAL_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 特定のニュースIDが指定されていればその記事のみ、なければ未処理の記事を取得
    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get('newsId')

    let targetNewsIds: string[] = []

    if (newsId) {
      targetNewsIds = [newsId]
    } else {
      // コメントがまだ生成されていないニュースを取得（最新10件）
      const newsWithoutComments = await prisma.news.findMany({
        where: {
          comments: {
            none: {},
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
      targetNewsIds = newsWithoutComments.map(n => n.id)
    }

    if (targetNewsIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: '処理対象のニュースがありません',
        generated: 0,
      })
    }

    // 全人格を取得
    const personas = await prisma.persona.findMany()

    const results = {
      processed: 0,
      generated: 0,
      errors: [] as string[],
      modelUsage: {} as Record<string, number>,
    }

    for (const newsId of targetNewsIds) {
      try {
        const news = await prisma.news.findUnique({
          where: { id: newsId },
          include: { comments: true },
        })

        if (!news) {
          results.errors.push(`News not found: ${newsId}`)
          continue
        }

        // 既にコメントがある場合はスキップ
        if (news.comments.length > 0) {
          continue
        }

        results.processed++

        // 各人格ごとにコメント生成（レート制限対策で遅延を入れる）
        for (let i = 0; i < personas.length; i++) {
          const persona = personas[i]
          let retryCount = 0
          const maxRetries = 3
          
          while (retryCount < maxRetries) {
            try {
              // レート制限対策: 最初以外は8秒待機
              if (i > 0 || retryCount > 0) {
                console.log(`レート制限対策: ${RATE_LIMIT_DELAY_MS}ms 待機中...`)
                await sleep(RATE_LIMIT_DELAY_MS)
              }

              const { content: comment, modelUsed } = await generateCommentWithFallback(
                persona.promptTemplate,
                news.title,
                news.description
              )

              // モデル使用状況を記録
              results.modelUsage[modelUsed] = (results.modelUsage[modelUsed] || 0) + 1

              await prisma.comment.create({
                data: {
                  newsId: news.id,
                  personaId: persona.id,
                  content: comment,
                },
              })

              results.generated++
              break // 成功したらリトライループを抜ける
            } catch (error) {
              retryCount++
              const errorMsg = `Failed to generate comment for persona ${persona.id} on news ${news.id} (attempt ${retryCount}/${maxRetries}): ${error instanceof Error ? error.message : 'Unknown error'}`
              console.error(errorMsg)
              
              if (retryCount >= maxRetries) {
                results.errors.push(errorMsg)
              }
            }
          }
        }
      } catch (error) {
        const errorMsg = `Failed to process news ${newsId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        results.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `コメント生成完了: ${results.processed}件のニュースに${results.generated}件のコメントを生成`,
      results,
      modelUsage: results.modelUsage,
    })
  } catch (error) {
    console.error('コメント生成エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GETメソッドでも実行可能に（Cron用）
export async function GET(request: Request) {
  return POST(request)
}
