import { WebhookServer } from './webhook-server.js';
import { PollingMonitor } from './polling-monitor.js';
import { config } from './config.js';

// Kullanım modu: 'webhook' veya 'polling'
const MODE = process.env.MODE || 'webhook';

console.log(`
╔═══════════════════════════════════════════════════════╗
║   Instagram Yorum Moderatörü                          ║
║   Otomatik Kötü Yorum Silme Sistemi                   ║
╚═══════════════════════════════════════════════════════╝
`);

// Konfigürasyon kontrolü
function validateConfig() {
  const errors = [];

  if (!config.instagram.accessToken) {
    errors.push('❌ INSTAGRAM_ACCESS_TOKEN tanımlı değil');
  }

  if (config.mediaIds.length === 0) {
    errors.push('⚠️  MEDIA_IDS tanımlı değil (post/reel ID\'leri)');
  }

  if (errors.length > 0) {
    console.log('\n🔧 Yapılandırma Uyarıları:\n');
    errors.forEach(err => console.log(err));
    console.log('\n💡 .env dosyasını kontrol edin\n');
  }

  return errors.length === 0;
}

async function main() {
  if (!validateConfig()) {
    console.log('⚠️  Bazı ayarlar eksik ama devam ediliyor...\n');
  }

  if (MODE === 'webhook') {
    // Webhook modu (gerçek zamanlı)
    const server = new WebhookServer();
    server.start();
  } else if (MODE === 'polling') {
    // Polling modu (periyodik kontrol)
    const interval = parseInt(process.env.POLLING_INTERVAL_MINUTES) || 2;
    const monitor = new PollingMonitor(interval);
    monitor.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Kapatılıyor...');
      monitor.stop();
      process.exit(0);
    });
  } else {
    console.log('❌ Geçersiz MODE. "webhook" veya "polling" olmalı.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal hata:', error);
  process.exit(1);
});

