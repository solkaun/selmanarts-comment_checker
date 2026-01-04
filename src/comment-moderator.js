import natural from 'natural';
import { badWords, badSymbols } from './config.js';

export class CommentModerator {
  constructor() {
    // Türkçe ve İngilizce için tokenizer
    this.tokenizer = new natural.WordTokenizer();
    // Sentiment analyzer - English için (opsiyonel)
    try {
      this.sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    } catch (error) {
      this.sentiment = null;
    }
  }

  // Yorumun kötü olup olmadığını kontrol et
  isBadComment(commentText) {
    if (!commentText || typeof commentText !== 'string') return false;

    const lowerText = commentText.toLowerCase().trim();
    
    // Boş veya çok kısa yorumlar
    if (lowerText.length < 2) return false;

    // 1. Kötü kelime kontrolü
    const hasBadWords = badWords.some(word => {
      const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
      return regex.test(lowerText);
    });

    if (hasBadWords) {
      return true;
    }

    // 2. Kötü sembol kontrolü
    const hasBadSymbols = badSymbols.some(symbol => commentText.includes(symbol));
    if (hasBadSymbols) {
      return true;
    }

    // 3. Aşırı büyük harf kullanımı (spam göstergesi)
    const uppercaseRatio = (commentText.match(/[A-ZÇĞİÖŞÜ]/g) || []).length / commentText.length;
    if (uppercaseRatio > 0.7 && commentText.length > 10) {
      return true;
    }

    // 4. Tekrarlayan karakterler (örn: "neeee", "çooook kötü")
    const hasRepeatingChars = /(.)\1{4,}/.test(commentText);
    if (hasRepeatingChars) {
      return true;
    }

    // 5. Sentiment analizi (opsiyonel - sadece İngilizce yorumlar için)
    if (this.sentiment) {
      try {
        const tokens = this.tokenizer.tokenize(lowerText);
        if (tokens && tokens.length > 0) {
          const score = this.sentiment.getSentiment(tokens);
          if (score < -3) {
            return true;
          }
        }
      } catch (error) {
        // Sentiment analizi hatasını sessizce yoksay
      }
    }

    return false;
  }

  // Yorum analizini detaylı raporla
  analyzeComment(commentText) {
    if (!commentText || typeof commentText !== 'string') {
      return { isBad: false, reasons: ['Geçersiz yorum metni'] };
    }
    
    const reasons = [];
    const lowerText = commentText.toLowerCase().trim();

    // Hangi kötü kelimeleri içeriyor
    const foundBadWords = badWords.filter(word => {
      const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
      return regex.test(lowerText);
    });

    if (foundBadWords.length > 0) {
      reasons.push(`Kötü kelimeler: ${foundBadWords.join(', ')}`);
    }

    // Hangi kötü sembolleri içeriyor
    const foundBadSymbols = badSymbols.filter(symbol => commentText.includes(symbol));
    if (foundBadSymbols.length > 0) {
      reasons.push(`Kötü semboller: ${foundBadSymbols.join(', ')}`);
    }

    const uppercaseRatio = (commentText.match(/[A-ZÇĞİÖŞÜ]/g) || []).length / commentText.length;
    if (uppercaseRatio > 0.7 && commentText.length > 10) {
      reasons.push('Aşırı büyük harf kullanımı');
    }

    if (/(.)\1{4,}/.test(commentText)) {
      reasons.push('Tekrarlayan karakterler');
    }

    return {
      isBad: this.isBadComment(commentText),
      reasons: reasons.length > 0 ? reasons : ['Normal yorum']
    };
  }
}

