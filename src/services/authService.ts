import axios, { type AxiosInstance } from 'axios';
import { type IPTVCredentials, type IPTVAccountInfo } from '../types';

const API_BASE = '/api/proxy';
class AuthService {
  private api: AxiosInstance | null = null;
  private credentials: IPTVCredentials | null = null;

  constructor() {
    this.loadCredentials();
  }

  private loadCredentials() {
    const saved = localStorage.getItem('iptv_credentials');
    if (saved) {
      try {
        this.credentials = JSON.parse(saved);
        this.initializeApi();
      } catch (error) {
        console.error('Failed to load saved credentials:', error);
        localStorage.removeItem('iptv_credentials');
      }
    }
  }

  private saveCredentials(credentials: IPTVCredentials) {
    localStorage.setItem('iptv_credentials', JSON.stringify(credentials));
  }

  private initializeApi() {
    if (!this.credentials) return;

    this.api = axios.create({
      baseURL: `${API_BASE}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async login(credentials: IPTVCredentials): Promise<IPTVAccountInfo> {
    try {
      // First, test the connection and get account info
      const targetURL = encodeURIComponent(`http://${credentials.url}:${credentials.port}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_account_info`);
      const response = await axios.get(`${API_BASE}?url=${targetURL}`);

      if (response.data && response.data.user_info) {
        // Update credentials with the server port from the response
        const updatedCredentials = {
          ...credentials,
          port: parseInt(response.data.server_info.port) || credentials.port
        };
        
        this.credentials = updatedCredentials;
        this.saveCredentials(updatedCredentials);
        this.initializeApi();
        return response.data;
      } else {
        throw new Error('Invalid credentials or server response');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new Error('Cannot connect to IPTV server. Please check the URL and port.');
        } else if (error.response?.status === 401) {
          throw new Error('Invalid username or password.');
        } else if (error.response?.status === 403) {
          throw new Error('Account access denied. Please check your subscription status.');
        } else {
          throw new Error(`Server error: ${error.response?.status || 'Unknown error'}`);
        }
      }
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  logout() {
    this.credentials = null;
    this.api = null;
    localStorage.removeItem('iptv_credentials');
  }

  isAuthenticated(): boolean {
    return this.credentials !== null && this.api !== null;
  }

  getCredentials(): IPTVCredentials | null {
    return this.credentials;
  }

  getApi(): AxiosInstance | null {
    return this.api;
  }

  getStreamUrl(streamId: string, streamType: 'movie' | 'series' = 'movie', containerExtension: string = 'mkv'): string | null {
    if (!this.credentials) return null;
    
    const { url, port, username, password } = this.credentials;
    return encodeURIComponent(`http://${url}:${port}/${streamType}/${username}/${password}/${streamId}.${containerExtension}`);
  }
}

export const authService = new AuthService();
