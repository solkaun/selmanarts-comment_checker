import dotenv from 'dotenv';
dotenv.config();

export const config = {
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    apiVersion: 'v18.0'
  },
  webhook: {
    verifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'mysecrettoken',
    port: process.env.PORT || 3000
  },
  mediaIds: process.env.MEDIA_IDS ? process.env.MEDIA_IDS.split(',').map(id => id.trim()) : []
};

// Kötü yorum tespiti için anahtar kelimeler
export const badWords = [
  "dolandırıcı",
  "dolandirici",
  "scam",
  "scammer",
  "ship",
  "shipping",
  "cargo",
  "kargo",
  "kargo nerede",
  "kargom",
  "kargom nerede",
  "göndermiyor",
  "📦",
  "🚨",
  "🚚",
  "dm bak",
  "dm",
  "order",
  "siparis",
  "siparisim",
  "sipariş",
  "siparişi",
  "siparişim",
  "nerede",
  "gondermiyorlar",
  "gonder",
  "money",
  "takip kodu",
  "takip kodu nerede",
];

// Negatif emoji ve semboller
export const badSymbols = ['📦', '🚨', '🚚'];

