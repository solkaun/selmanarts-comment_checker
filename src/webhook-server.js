import express from 'express';
import { config } from './config.js';
import { InstagramAPI } from './instagram-api.js';
import { CommentModerator } from './comment-moderator.js';

export class WebhookServer {
  constructor() {
    this.app = express();
    this.instagramAPI = new InstagramAPI();
    this.moderator = new CommentModerator();
    
    this.app.use(express.json());
    this.setupRoutes();
  }

  setupRoutes() {
    // Webhook verification (GET)
    this.app.get('/webhook', (req, res) => {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode && token) {
        if (mode === 'subscribe' && token === config.webhook.verifyToken) {
          console.log('✅ Webhook doğrulandı!');
          res.status(200).send(challenge);
        } else {
          console.log('❌ Webhook doğrulama başarısız!');
          res.sendStatus(403);
        }
      }
    });

    // Webhook events (POST)
    this.app.post('/webhook', async (req, res) => {
      // Hızlı yanıt ver (Instagram 20 saniye içinde cevap bekler)
      res.status(200).send('EVENT_RECEIVED');

      const body = req.body;

      if (body.object === 'instagram') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'comments') {
              await this.handleCommentEvent(change.value);
            }
          }
        }
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        monitoredPosts: config.mediaIds.length,
        timestamp: new Date().toISOString()
      });
    });

    // Manuel kontrol endpoint'i
    this.app.post('/check-media/:mediaId', async (req, res) => {
      const { mediaId } = req.params;
      try {
        const deleted = await this.checkAndModerateMedia(mediaId);
        res.json({ 
          success: true, 
          mediaId, 
          deletedComments: deleted 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    });
  }

  async handleCommentEvent(commentData) {
    try {
      const { id: commentId, text, media } = commentData;

      console.log(`\n📨 Yeni yorum: ${commentId}`);
      console.log(`📝 İçerik: "${text || '(boş)'}"`);

      // Sadece takip edilen medyalarda kontrol yap
     /*
      if (config.mediaIds.length > 0 && !config.mediaIds.includes(media?.id)) {
        console.log('⏭️  Bu medya takip edilmiyor, atlandı.');
        return;
      }
      */

      // Boş yorum kontrolü
      if (!text || typeof text !== 'string') {
        console.log('⚠️  Boş/geçersiz yorum, atlandı.');
        return;
      }

      // Yorumu analiz et
      const analysis = this.moderator.analyzeComment(text);
      
      if (analysis.isBad) {
        console.log(`🚫 Kötü yorum tespit edildi!`);
        console.log(`📋 Nedenler: ${analysis.reasons.join(', ')}`);
        
        const deleted = await this.instagramAPI.deleteComment(commentId);
        
        if (deleted) {
          console.log(`✅ Yorum silindi: ${commentId}`);
        } else {
          console.log(`❌ Yorum silinemedi: ${commentId}`);
        }
      } else {
        console.log(`✅ Yorum temiz, onaylandı.`);
      }
    } catch (error) {
      console.error('Yorum işlenirken hata:', error.message);
    }
  }

  // Bir medyadaki tüm yorumları kontrol et ve kötüleri sil
  async checkAndModerateMedia(mediaId) {
    console.log(`\n🔍 Medya kontrol ediliyor: ${mediaId}`);
    
    const comments = await this.instagramAPI.getComments(mediaId);
    console.log(`📊 ${comments.length} yorum bulundu`);
    
    let deletedCount = 0;

    for (const comment of comments) {
      // Yorum metni kontrolü
      if (!comment.text || typeof comment.text !== 'string') {
        console.log(`⚠️  Boş/geçersiz yorum atlandı: ${comment.id}`);
        continue;
      }

      const analysis = this.moderator.analyzeComment(comment.text);
      
      if (analysis.isBad) {
        console.log(`\n🚫 Kötü yorum: ${comment.id}`);
        console.log(`👤 Kullanıcı: ${comment.username}`);
        console.log(`📝 İçerik: "${comment.text}"`);
        console.log(`📋 Nedenler: ${analysis.reasons.join(', ')}`);
        
        const deleted = await this.instagramAPI.deleteComment(comment.id);
        
        if (deleted) {
          console.log(`✅ Silindi`);
          deletedCount++;
        } else {
          console.log(`❌ Silinemedi`);
        }
        
        // Rate limiting için bekleme
        await this.sleep(1000);
      }
    }

    console.log(`\n✅ Kontrol tamamlandı. ${deletedCount} yorum silindi.`);
    return deletedCount;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  start() {
    this.app.listen(config.webhook.port, () => {
      console.log(`\n🚀 Instagram Yorum Moderatörü başlatıldı!`);
      console.log(`📡 Webhook dinleniyor: http://localhost:${config.webhook.port}/webhook`);
      console.log(`🔍 Takip edilen medya sayısı: ${config.mediaIds.length}`);
      console.log(`\n⚙️  Ayarlar:`);
      console.log(`   - Access Token: ${config.instagram.accessToken ? '✅ Tanımlı' : '❌ Eksik'}`);
      console.log(`   - Business Account ID: ${config.instagram.businessAccountId || '❌ Eksik'}`);
      console.log(`   - Media IDs: ${config.mediaIds.join(', ') || '❌ Tanımsız'}`);
      console.log(`\n💡 Manuel kontrol için: POST http://localhost:${config.webhook.port}/check-media/:mediaId\n`);
    });
  }
}

