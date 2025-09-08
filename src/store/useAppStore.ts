import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  type AppState, 
  type IPTVCredentials, 
  type IPTVMovie, 
  type IPTVSeries, 
  type IPTVSeriesDetail,
  type IPTVSeason, 
  type IPTVEpisode,
  type DownloadProgress 
} from '../types';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';

interface AppStore extends AppState {
  // Auth actions
  login: (credentials: IPTVCredentials) => Promise<void>;
  logout: () => void;
  
  // Data loading actions
  loadAccountInfo: () => Promise<void>;
  loadMovies: (categoryId?: string) => Promise<void>;
  loadSeries: (categoryId?: string) => Promise<void>;
  loadMovieCategories: () => Promise<void>;
  loadSeriesCategories: () => Promise<void>;
  
  // Selection actions
  selectMovie: (movie: IPTVMovie | null) => void;
  selectSeries: (series: IPTVSeries | null) => void;
  selectSeriesDetail: (seriesDetail: IPTVSeriesDetail | null) => void;
  selectSeason: (season: IPTVSeason | null) => void;
  selectEpisode: (episode: IPTVEpisode | null) => void;
  
  // Series detail actions
  loadSeriesDetail: (seriesId: string) => Promise<void>;
  
  // Search and filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  searchMovies: (query: string) => Promise<void>;
  searchSeries: (query: string) => Promise<void>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Download actions
  downloads: DownloadProgress[];
  addDownload: (download: DownloadProgress) => void;
  updateDownload: (id: string, updates: Partial<DownloadProgress>) => void;
  removeDownload: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      credentials: null,
      accountInfo: null,
      movies: [],
      series: [],
      movieCategories: [],
      seriesCategories: [],
      selectedMovie: null,
      selectedSeries: null,
      selectedSeriesDetail: null,
      selectedSeason: null,
      selectedEpisode: null,
      searchQuery: '',
      selectedCategory: '',
      isLoading: false,
      error: null,
      downloads: [],

      // Auth actions
      login: async (credentials: IPTVCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const accountInfo = await authService.login(credentials);
          set({
            isAuthenticated: true,
            credentials,
            accountInfo,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          isAuthenticated: false,
          credentials: null,
          accountInfo: null,
          movies: [],
          series: [],
          movieCategories: [],
          seriesCategories: [],
          selectedMovie: null,
          selectedSeries: null,
          selectedSeason: null,
          selectedEpisode: null,
          searchQuery: '',
          selectedCategory: '',
          error: null,
        });
      },

      // Data loading actions
      loadAccountInfo: async () => {
        set({ isLoading: true, error: null });
        try {
          const accountInfo = await apiService.getAccountInfo();
          set({ accountInfo, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load account info',
            isLoading: false,
          });
        }
      },

      loadMovies: async (categoryId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const movies = await apiService.getMovies(categoryId);
          set({ movies, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load movies',
            isLoading: false,
          });
        }
      },

      loadSeries: async (categoryId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const series = await apiService.getSeries(categoryId);
          set({ series, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load series',
            isLoading: false,
          });
        }
      },

      loadMovieCategories: async () => {
        try {
          const movieCategories = await apiService.getMovieCategories();
          set({ movieCategories });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load movie categories',
          });
        }
      },

      loadSeriesCategories: async () => {
        try {
          const seriesCategories = await apiService.getSeriesCategories();
          set({ seriesCategories });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load series categories',
          });
        }
      },

      // Selection actions
      selectMovie: (movie: IPTVMovie | null) => {
        set({ selectedMovie: movie });
      },

      selectSeries: (series: IPTVSeries | null) => {
        set({ selectedSeries: series });
      },

      selectSeriesDetail: (seriesDetail: IPTVSeriesDetail | null) => {
        set({ selectedSeriesDetail: seriesDetail });
      },

      selectSeason: (season: IPTVSeason | null) => {
        set({ selectedSeason: season });
      },

      selectEpisode: (episode: IPTVEpisode | null) => {
        set({ selectedEpisode: episode });
      },

      // Series detail actions
      loadSeriesDetail: async (seriesId: string) => {
        set({ isLoading: true, error: null });
        try {
          const seriesDetail = await apiService.getSeriesInfo(seriesId);
          if (seriesDetail) {
            set({ 
              selectedSeriesDetail: seriesDetail,
              isLoading: false 
            });
          } else {
            set({ 
              error: 'Failed to load series details',
              isLoading: false 
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load series details',
            isLoading: false,
          });
        }
      },

      // Search and filter actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedCategory: (categoryId: string) => {
        set({ selectedCategory: categoryId });
      },

      searchMovies: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const movies = await apiService.searchMovies(query);
          set({ movies, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Search failed',
            isLoading: false,
          });
        }
      },

      searchSeries: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const series = await apiService.searchSeries(query);
          set({ series, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Search failed',
            isLoading: false,
          });
        }
      },

      // Utility actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Download actions
      addDownload: (download: DownloadProgress) => {
        set((state) => ({
          downloads: [...state.downloads, download],
        }));
      },

      updateDownload: (id: string, updates: Partial<DownloadProgress>) => {
        set((state) => ({
          downloads: state.downloads.map((download) =>
            download.id === id ? { ...download, ...updates } : download
          ),
        }));
      },

      removeDownload: (id: string) => {
        set((state) => ({
          downloads: state.downloads.filter((download) => download.id !== id),
        }));
      },
    }),
    {
      name: 'iptv-app-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        credentials: state.credentials,
        accountInfo: state.accountInfo,
        downloads: state.downloads,
      }),
    }
  )
);
