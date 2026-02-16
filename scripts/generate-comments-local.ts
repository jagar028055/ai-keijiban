import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const FREE_MODELS = [
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B', priority: 1 },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'NVIDIA Nemotron 3 Nano', priority: 2 },
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee AI Trinity', priority: 3 },
]

const RATE_LIMIT_DELAY_MS = 8000

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
        messages: [{ role: 'user', content: prompt }],
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
    
    if (content) {
      content = content.replace(/^[「"'](.+)[」"']$/, '$1').trim()
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

async function generateCommentWithFallback(
  promptTemplate: string,
  title: string,
  description: string | null,
  apiKey: string
): Promise<{ content: string; modelUsed: string }> {
  const prompt = promptTemplate
    .replace('{title}', title)
    .replace('{description}', description || '（概要なし）')

  for (const modelConfig of FREE_MODELS) {
    console.log(`Trying model: ${modelConfig.name}`)
    
    const result = await tryGenerateComment(modelConfig.id, prompt, apiKey)
    
    if (result.success && result.content) {
      console.log(`✓ Success with ${modelConfig.name}`)
      return { content: result.content, modelUsed: modelConfig.name }
    } else {
      console.log(`✗ Failed with ${modelConfig.name}: ${result.error}`)
      continue
    }
  }

  throw new Error('All models failed to generate comment')
}

async function main() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set')
    }

    console.log('コメント生成を開始します...')

    // コメントがまだ生成されていないニュースを取得
    const newsWithoutComments = await prisma.news.findMany({
      where: {
        comments: { none: {} },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    if (newsWithoutComments.length === 0) {
      console.log('処理対象のニュースがありません')
      return
    }

    console.log(`${newsWithoutComments.length}件のニュースにコメントを生成します`)

    const personas = await prisma.persona.findMany()
    console.log(`${personas.length}人の人格を取得しました`)

    let generated = 0
    let errors = 0

    for (let newsIndex = 0; newsIndex < newsWithoutComments.length; newsIndex++) {
      const news = newsWithoutComments[newsIndex]
      console.log(`\n[${newsIndex + 1}/${newsWithoutComments.length}] ${news.title}`)

      for (let i = 0; i < personas.length; i++) {
        const persona = personas[i]
        
        try {
          if (i > 0) {
            console.log(`  レート制限対策: ${RATE_LIMIT_DELAY_MS}ms 待機中...`)
            await sleep(RATE_LIMIT_DELAY_MS)
          }

          console.log(`  人格「${persona.displayName}」のコメントを生成中...`)
          
          const { content: comment } = await generateCommentWithFallback(
            persona.promptTemplate,
            news.title,
            news.description,
            apiKey
          )

          await prisma.comment.create({
            data: {
              newsId: news.id,
              personaId: persona.id,
              content: comment,
            },
          })

          generated++
          console.log(`  ✓ コメント生成完了`)
        } catch (error) {
          errors++
          console.error(`  ✗ エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    console.log(`\n=== 完了 ===`)
    console.log(`生成したコメント: ${generated}件`)
    console.log(`エラー: ${errors}件`)

  } catch (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
