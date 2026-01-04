import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'deleted-comments.txt');

// Logs klasörünü oluştur
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export class Logger {
  static logDeletedComment(commentData) {
    const timestamp = new Date().toLocaleString('tr-TR');
    const logEntry = `
${'='.repeat(80)}
[${timestamp}] YORUM SİLİNDİ
${'='.repeat(80)}
Yorum ID: ${commentData.commentId}
Kullanıcı: ${commentData.username || 'Bilinmiyor'}
Media ID: ${commentData.mediaId || 'Bilinmiyor'}
İçerik: "${commentData.text}"
Silinme Nedenleri: ${commentData.reasons.join(', ')}
${'='.repeat(80)}

`;

    try {
      fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    } catch (error) {
      console.error('❌ Log dosyasına yazılamadı:', error.message);
    }
  }

  static logCheckCompleted(stats) {
    const timestamp = new Date().toLocaleString('tr-TR');
    const logEntry = `[${timestamp}] Kontrol Tamamlandı - ${stats.totalChecked} medya kontrol edildi, ${stats.totalDeleted} yorum silindi\n`;
    
    try {
      fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    } catch (error) {
      console.error('❌ Log dosyasına yazılamadı:', error.message);
    }
  }

  static getLogPath() {
    return LOG_FILE;
  }
}

