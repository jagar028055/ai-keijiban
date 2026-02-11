import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const newsCount = await prisma.news.count();
    const commentCount = await prisma.comment.count();
    const personaCount = await prisma.persona.count();
    
    console.log('=== データベース状況 ===');
    console.log('ニュース総数:', newsCount);
    console.log('コメント総数:', commentCount);
    console.log('人格総数:', personaCount);
    
    if (commentCount > 0) {
      const comments = await prisma.comment.findMany({
        take: 5,
        include: { 
          news: true, 
          persona: true 
        }
      });
      
      console.log('\n=== 最新コメント ===');
      for (const comment of comments) {
        console.log(`\n【${comment.persona.displayName}】`);
        console.log(`ニュース: ${comment.news.title.substring(0, 50)}...`);
        console.log(`コメント: ${comment.content.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
