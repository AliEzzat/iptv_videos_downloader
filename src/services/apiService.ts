import axios from 'axios';
import { authService } from './authService';
import { 
  type IPTVMovie, 
  type IPTVSeries, 
  type IPTVCategory, 
  type IPTVSeason, 
  type IPTVEpisode,
  type IPTVApiResponse 
} from '../types';

class ApiService {
  private getCredentials() {
    const credentials = authService.getCredentials();
    if (!credentials) {
      throw new Error('Not authenticated. Please login first.');
    }
    return credentials;
  }

  private getApiUrl() {
    const credentials = this.getCredentials();
    return `http://${credentials.url}:${credentials.port}`;
  }

  private getApiParams() {
    const credentials = this.getCredentials();
    return {
      username: credentials.username,
      password: credentials.password,
    };
  }

  async getAccountInfo() {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const response = await axios.get(`${apiUrl}/player_api.php`, {
      params: {
        ...params,
        action: 'get_account_info',
      },
    });
    return response.data;
  }

  async getMovieCategories(): Promise<IPTVCategory[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const response = await axios.get(`${apiUrl}/player_api.php`, {
      params: {
        ...params,
        action: 'get_vod_categories',
      },
    });
    return response.data;
  }

  async getSeriesCategories(): Promise<IPTVCategory[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const response = await axios.get(`${apiUrl}/player_api.php`, {
      params: {
        ...params,
        action: 'get_series_categories',
      },
    });
    return response.data;
  }

  async getMovies(categoryId?: string): Promise<IPTVMovie[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const requestParams: any = {
      ...params,
      action: 'get_vod_streams',
    };
    
    if (categoryId) {
      requestParams.category_id = categoryId;
    }

    const response = await axios.get(`${apiUrl}/player_api.php`, { 
      params: requestParams 
    });
    return response.data;
  }

  async getSeries(categoryId?: string): Promise<IPTVSeries[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const requestParams: any = {
      ...params,
      action: 'get_series',
    };
    
    if (categoryId) {
      requestParams.category_id = categoryId;
    }

    const response = await axios.get(`${apiUrl}/player_api.php`, { 
      params: requestParams 
    });
    return response.data;
  }

  async getSeriesInfo(seriesId: string): Promise<IPTVSeries | null> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    try {
      const response = await axios.get(`${apiUrl}/player_api.php`, {
        params: {
          ...params,
          action: 'get_series_info',
          series_id: seriesId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get series info:', error);
      return null;
    }
  }

  async getSeriesSeasons(seriesId: string): Promise<IPTVSeason[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const response = await axios.get(`${apiUrl}/player_api.php`, {
      params: {
        ...params,
        action: 'get_series_info',
        series_id: seriesId,
      },
    });
    return response.data.seasons || [];
  }

  async getSeriesEpisodes(seriesId: string, seasonNumber: number): Promise<IPTVEpisode[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const response = await axios.get(`${apiUrl}/player_api.php`, {
      params: {
        ...params,
        action: 'get_series_info',
        series_id: seriesId,
      },
    });
    
    const season = response.data.seasons?.find((s: IPTVSeason) => s.season_number === seasonNumber);
    return season?.episodes || [];
  }

  async searchMovies(query: string): Promise<IPTVMovie[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const response = await axios.get(`${apiUrl}/player_api.php`, {
      params: {
        ...params,
        action: 'get_vod_streams',
        search: query,
      },
    });
    return response.data;
  }

  async searchSeries(query: string): Promise<IPTVSeries[]> {
    const apiUrl = this.getApiUrl();
    const params = this.getApiParams();
    
    const response = await axios.get(`${apiUrl}/player_api.php`, {
      params: {
        ...params,
        action: 'get_series',
        search: query,
      },
    });
    return response.data;
  }

  getStreamUrl(streamId: string, streamType: 'movie' | 'series' = 'movie', containerExtension: string = 'mkv'): string | null {
    return authService.getStreamUrl(streamId, streamType, containerExtension);
  }

  async downloadStream(streamId: string, streamType: 'movie' | 'series' = 'movie'): Promise<Blob> {
    const streamUrl = this.getStreamUrl(streamId, streamType);
    if (!streamUrl) {
      throw new Error('Stream URL not available');
    }

    const response = await fetch(streamUrl);
    if (!response.ok) {
      throw new Error(`Failed to download stream: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const apiService = new ApiService();
