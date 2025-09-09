import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import MovieCard from './MovieCard';
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { IPTVMovie } from '../types';

const PAGE_SIZE = 30;

const BrowseMovies: React.FC = () => {
  const {
    movies, // all movies loaded at once
    movieCategories,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    loadMovies,
    loadMovieCategories,
    setSelectedCategory,
    setSearchQuery,
    selectMovie,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const moviesGridRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadMovieCategories();
    loadMovies(selectedCategory);
  }, [loadMovieCategories, loadMovies, selectedCategory]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    setPage(1); // reset page on search change
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1); // reset page on category change
  };

  const handlePlay = (movie: IPTVMovie) => {
    selectMovie(movie);
    navigate(`/movies/${movie.stream_id}`, { state: { backgroundLocation: location.pathname } });
  };

  const handleDownload = (movie: IPTVMovie) => {
    console.log('Download movie:', movie.name);
  };

  // Filter movies by category + search query, memoized for performance
  const filteredMovies = useMemo(() => {
    let filtered = movies;
    if (selectedCategory) {
      filtered = filtered.filter(movie => movie.category_id === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [movies, selectedCategory, searchQuery]);

  // Calculate movies to show on current page
  const paginatedMovies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredMovies.slice(start, end);
  }, [filteredMovies, page]);

  // Check if we have more pages
  const hasMorePages = page * PAGE_SIZE < filteredMovies.length;

  // Remote navigation for movies grid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!moviesGridRef.current) return;
      const focusable = Array.from(moviesGridRef.current.querySelectorAll('[data-movie-item]')) as HTMLElement[];
      if (focusable.length === 0) return;
      
      const currentIndex = focusable.findIndex(el => el === document.activeElement);
      const columns = viewMode === 'grid' ? 6 : 1; // Adjust based on responsive grid
      let nextIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowRight':
          nextIndex = Math.min(focusable.length - 1, (currentIndex === -1 ? 0 : currentIndex + 1));
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(0, (currentIndex === -1 ? 0 : currentIndex - 1));
          break;
        case 'ArrowDown':
          nextIndex = Math.min(focusable.length - 1, (currentIndex === -1 ? 0 : currentIndex + columns));
          break;
        case 'ArrowUp':
          nextIndex = Math.max(0, (currentIndex === -1 ? 0 : currentIndex - columns));
          break;
        case 'Enter':
          if (currentIndex >= 0) {
            e.preventDefault();
            focusable[currentIndex].click();
          }
          return;
        case 'PageDown':
          e.preventDefault();
          if (hasMorePages) {
            setPage(p => p + 1);
            setFocusedIndex(0);
          }
          return;
        case 'PageUp':
          e.preventDefault();
          if (page > 1) {
            setPage(p => p - 1);
            setFocusedIndex(0);
          }
          return;
        default:
          return;
      }
      e.preventDefault();
      focusable[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, hasMorePages, page]);

  // Focus first item when page changes
  useEffect(() => {
    if (moviesGridRef.current && paginatedMovies.length > 0) {
      const firstItem = moviesGridRef.current.querySelector('[data-movie-item]') as HTMLElement;
      firstItem?.focus();
      setFocusedIndex(0);
    }
  }, [page, paginatedMovies.length]);

  return (
    <div className="p-6">
      {/* Header with view mode */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Movies</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search movies..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {showFilters && (
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {movieCategories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <span className="text-white text-lg">Loading movies...</span>
          </div>
        </div>
      )}

      {/* Movies Grid/List */}
      {!isLoading && !error && (
        <>
          {paginatedMovies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-dark-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
              <p className="text-dark-400">
                {searchQuery ? 'Try adjusting your search terms' : 'No movies available in this category'}
              </p>
            </div>
          ) : (
            <div
              ref={moviesGridRef}
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                  : 'grid-cols-1'
              }`}
            >
              {paginatedMovies.map((movie, index) => (
                <div key={movie.stream_id} data-movie-item>
                  <MovieCard
                    movie={movie}
                    onPlay={handlePlay}
                    onDownload={handleDownload}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && filteredMovies.length > PAGE_SIZE && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-dark-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={!hasMorePages}
            onClick={() => setPage(p => (hasMorePages ? p + 1 : p))}
            className="px-4 py-2 bg-dark-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseMovies;
