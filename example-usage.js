// Instagram Yorum Moderatörü - Kullanım Örnekleri

import { InstagramAPI } from './src/instagram-api.js';
import { CommentModerator } from './src/comment-moderator.js';
import { config } from './src/config.js';

// Örnek 1: Bir yorumun kötü olup olmadığını kontrol et
async function testCommentModeration() {
  const moderator = new CommentModerator();
  
  const testComments = [
    "Harika paylaşım! 👍",
    "Bu ne boktan bir şey ya",
    "ÇOOOK KÖTÜ YAPIYORSUN BIRAAK ARTIK!!!",
    "💩💩💩",
    "neeeeee yaptın aaaaa çoooook kötüüüüü"
  ];

  console.log("📝 Yorum Moderasyon Testleri:\n");
  
  testComments.forEach(comment => {
    const analysis = moderator.analyzeComment(comment);
    console.log(`Yorum: "${comment}"`);
    console.log(`Durum: ${analysis.isBad ? '🚫 KÖTÜ' : '✅ Temiz'}`);
    console.log(`Nedenler: ${analysis.reasons.join(', ')}`);
    console.log('---\n');
  });
}

// Örnek 2: Bir medyadaki tüm yorumları getir
async function getAllComments(mediaId) {
  const api = new InstagramAPI();
  
  console.log(`\n📸 Media ID: ${mediaId}`);
  console.log('Yorumlar getiriliyor...\n');
  
  const comments = await api.getComments(mediaId);
  
  comments.forEach(comment => {
    console.log(`👤 ${comment.username}: ${comment.text}`);
    console.log(`🕐 ${comment.timestamp}`);
    console.log('---');
  });
  
  console.log(`\n✅ Toplam ${comments.length} yorum`);
}

// Örnek 3: Belirli bir yorumu sil
async function deleteSpecificComment(commentId) {
  const api = new InstagramAPI();
  
  console.log(`\n🗑️  Yorum siliniyor: ${commentId}`);
  
  const success = await api.deleteComment(commentId);
  
  if (success) {
    console.log('✅ Yorum başarıyla silindi');
  } else {
    console.log('❌ Yorum silinemedi');
  }
}

// Örnek 4: Bir medyadaki tüm kötü yorumları temizle
async function cleanMedia(mediaId) {
  const api = new InstagramAPI();
  const moderator = new CommentModerator();
  
  console.log(`\n🧹 Medya temizleniyor: ${mediaId}\n`);
  
  const comments = await api.getComments(mediaId);
  let deletedCount = 0;
  
  for (const comment of comments) {
    const analysis = moderator.analyzeComment(comment.text);
    
    if (analysis.isBad) {
      console.log(`🚫 Kötü yorum bulundu:`);
      console.log(`   👤 ${comment.username}`);
      console.log(`   💬 "${comment.text}"`);
      console.log(`   📋 ${analysis.reasons.join(', ')}`);
      
      const deleted = await api.deleteComment(comment.id);
      if (deleted) {
        console.log(`   ✅ Silindi\n`);
        deletedCount++;
      } else {
        console.log(`   ❌ Silinemedi\n`);
      }
      
      // Rate limit için bekle
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n🎯 Sonuç: ${deletedCount}/${comments.length} yorum silindi`);
}

// Kullanım örnekleri
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const param = process.argv[3];

  switch (command) {
    case 'test':
      await testCommentModeration();
      break;
    
    case 'list':
      if (!param) {
        console.log('❌ Media ID gerekli: node example-usage.js list MEDIA_ID');
        process.exit(1);
      }
      await getAllComments(param);
      break;
    
    case 'delete':
      if (!param) {
        console.log('❌ Comment ID gerekli: node example-usage.js delete COMMENT_ID');
        process.exit(1);
      }
      await deleteSpecificComment(param);
      break;
    
    case 'clean':
      if (!param) {
        console.log('❌ Media ID gerekli: node example-usage.js clean MEDIA_ID');
        process.exit(1);
      }
      await cleanMedia(param);
      break;
    
    default:
      console.log(`
Instagram Yorum Moderatörü - Kullanım Örnekleri

Komutlar:
  node example-usage.js test                    # Moderasyon testleri
  node example-usage.js list <MEDIA_ID>         # Medyadaki yorumları listele
  node example-usage.js delete <COMMENT_ID>     # Belirli yorumu sil
  node example-usage.js clean <MEDIA_ID>        # Medyadaki kötü yorumları temizle
      `);
  }
}

