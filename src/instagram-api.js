import axios from 'axios';
import { config } from './config.js';

const BASE_URL = `https://graph.facebook.com/${config.instagram.apiVersion}`;

export class InstagramAPI {
  constructor() {
    this.accessToken = config.instagram.accessToken;
  }

  // Bir medya için tüm yorumları getir
  async getComments(mediaId) {
    try {
      const response = await axios.get(`${BASE_URL}/${mediaId}/comments`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,text,timestamp,username,from'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error(`Yorumlar alınırken hata (${mediaId}):`, error.response?.data || error.message);
      return [];
    }
  }

  // Yorum sil
  async deleteComment(commentId) {
    try {
      const response = await axios.delete(`${BASE_URL}/${commentId}`, {
        params: {
          access_token: this.accessToken
        }
      });
      return response.data.success;
    } catch (error) {
      console.error(`Yorum silinirken hata (${commentId}):`, error.response?.data || error.message);
      return false;
    }
  }

  // Belirli bir yorumu getir
  async getComment(commentId) {
    try {
      const response = await axios.get(`${BASE_URL}/${commentId}`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,text,timestamp,username,from,media'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Yorum bilgisi alınırken hata (${commentId}):`, error.response?.data || error.message);
      return null;
    }
  }

  // Webhook için medya aboneliği oluştur
  async subscribeToWebhooks() {
    console.log('Webhook abonelikleri Instagram App Dashboard üzerinden yapılmalıdır.');
    console.log('https://developers.facebook.com/apps/ adresinden uygulamanızı seçin.');
    console.log('Webhooks > Instagram > Subscribe to: comments');
  }
}

