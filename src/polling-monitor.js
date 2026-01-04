import { InstagramAPI } from './instagram-api.js';
import { CommentModerator } from './comment-moderator.js';
import { config } from './config.js';

// Webhook alternatifi: Periyodik kontrol sistemi
export class PollingMonitor {
  constructor(intervalMinutes = 2) {
    this.instagramAPI = new InstagramAPI();
    this.moderator = new CommentModerator();
    this.intervalMs = intervalMinutes * 60 * 1000;
    this.seenComments = new Set(); // Daha önce görülen yorumları takip et
    this.isRunning = false;
  }

  async checkMedia(mediaId) {
    try {
      const comments = await this.instagramAPI.getComments(mediaId);
      
      for (const comment of comments) {
        // Daha önce görülen yorumları atla
        if (this.seenComments.has(comment.id)) {
          continue;
        }

        this.seenComments.add(comment.id);

        // Yorum metni kontrolü
        if (!comment.text || typeof comment.text !== 'string') {
          console.log(`⚠️  Boş/geçersiz yorum atlandı: ${comment.id}`);
          continue;
        }

        const analysis = this.moderator.analyzeComment(comment.text);
        
        if (analysis.isBad) {
          console.log(`\n🚫 Kötü yorum tespit edildi!`);
          console.log(`📍 Media: ${mediaId}`);
          console.log(`💬 Yorum ID: ${comment.id}`);
          console.log(`👤 Kullanıcı: ${comment.username}`);
          console.log(`📝 İçerik: "${comment.text}"`);
          console.log(`📋 Nedenler: ${analysis.reasons.join(', ')}`);
          
          const deleted = await this.instagramAPI.deleteComment(comment.id);
          
          if (deleted) {
            console.log(`✅ Yorum silindi`);
          } else {
            console.log(`❌ Yorum silinemedi`);
          }
          
          await this.sleep(1000);
        }
      }
    } catch (error) {
      console.error(`Medya kontrol hatası (${mediaId}):`, error.message);
    }
  }

  async checkAllMedia() {
    console.log(`\n🔄 Yorumlar kontrol ediliyor... [${new Date().toLocaleString('tr-TR')}]`);
    
    for (const mediaId of config.mediaIds) {
      await this.checkMedia(mediaId);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring zaten çalışıyor!');
      return;
    }

    if (config.mediaIds.length === 0) {
      console.log('❌ Takip edilecek medya ID\'si tanımlı değil!');
      return;
    }

    this.isRunning = true;
    console.log(`\n🚀 Polling Monitor başlatıldı!`);
    console.log(`⏱️  Kontrol aralığı: ${this.intervalMs / 60000} dakika`);
    console.log(`📋 Takip edilen medyalar: ${config.mediaIds.join(', ')}`);
    
    // İlk kontrolü hemen yap
    this.checkAllMedia();
    
    // Periyodik kontrolleri başlat
    this.intervalId = setInterval(() => {
      this.checkAllMedia();
    }, this.intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('\n⏹️  Monitoring durduruldu');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

