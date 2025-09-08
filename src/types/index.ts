// IPTV API Response Types
export interface IPTVCredentials {
  url: string;
  port: number;
  username: string;
  password: string;
}

export interface IPTVAccountInfo {
  user_info: {
    username: string;
    password: string;
    auth: number;
    status: string;
    exp_date: string;
    is_trial: string;
    active_cons: string;
    created_at: string;
    max_connections: string;
    allowed_output_formats: string[];
  };
  server_info: {
    url: string;
    port: string;
    https_port: string;
    protocol: string;
    rtmp_port: string;
    timezone: string;
    timestamp_now: number;
    time_now: string;
  };
}

export interface IPTVCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface IPTVMovie {
  stream_id: string;
  name: string;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  icon: string;
  stream_icon: string;
  stream_type: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  duration: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  tmdb_id: string;
  youtube_trailer: string;
  episode_run_time: string;
  category_ids: number[];
}

export interface IPTVSeries {
  series_id: string;
  name: string;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  icon: string;
  stream_icon: string;
  stream_type: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  tmdb_id: string;
  youtube_trailer: string;
  category_ids: number[];
}

export interface IPTVEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    plot: string;
    cast: string;
    director: string;
    genre: string;
    release_date: string;
    rating: string;
    duration: string;
    movie_image: string;
  };
  custom_sid: string;
  added: string;
  season: number;
  direct_source: string;
}

export interface IPTVSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  cover: string;
  cover_big: string;
  episodes: IPTVEpisode[];
}

// App State Types
export interface AppState {
  isAuthenticated: boolean;
  credentials: IPTVCredentials | null;
  accountInfo: IPTVAccountInfo | null;
  movies: IPTVMovie[];
  series: IPTVSeries[];
  movieCategories: IPTVCategory[];
  seriesCategories: IPTVCategory[];
  selectedMovie: IPTVMovie | null;
  selectedSeries: IPTVSeries | null;
  selectedSeason: IPTVSeason | null;
  selectedEpisode: IPTVEpisode | null;
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
}

// Video Player Types
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  buffered: number;
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface IPTVApiResponse<T> {
  info: {
    totalcount: number;
    server_time: number;
    timezone: string;
  };
  data: T;
}

// Download Types
export interface DownloadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error' | 'paused';
  error?: string;
  url: string;
  size?: number;
  downloaded?: number;
}
