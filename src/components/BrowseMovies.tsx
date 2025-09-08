import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import MovieCard from './MovieCard';
import { type IPTVMovie } from '../types';
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react';

const BrowseMovies: React.FC = () => {
  const {
    movies,
    movieCategories,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    loadMovies,
    loadMovieCategories,
    setSelectedCategory,
    setSearchQuery,
    searchMovies,
    selectMovie,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMovieCategories();
    loadMovies();
  }, [loadMovieCategories, loadMovies]);

  useEffect(() => {
    if (selectedCategory) {
      loadMovies(selectedCategory);
    } else {
      loadMovies();
    }
  }, [selectedCategory, loadMovies]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchMovies(query);
    } else {
      loadMovies(selectedCategory);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handlePlay = (movie: IPTVMovie) => {
    selectMovie(movie);
  };

  const handleDownload = (movie: IPTVMovie) => {
    // Download functionality will be implemented
    console.log('Download movie:', movie.name);
  };

  const filteredMovies = movies.filter(movie => {
    if (!searchQuery) return true;
    return movie.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6">
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
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
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

      {/* Movies Grid */}
      {!isLoading && !error && (
        <>
          {filteredMovies.length === 0 ? (
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
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                : 'grid-cols-1'
            }`}>
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.stream_id}
                  movie={movie}
                  onPlay={handlePlay}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseMovies;
