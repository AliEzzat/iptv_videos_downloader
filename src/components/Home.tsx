import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Star, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const { 
    movies, 
    series, 
    loadMovies, 
    loadSeries, 
    selectMovie, 
    selectSeries,
    isLoading 
  } = useAppStore();

  useEffect(() => {
    if (!movies || movies.length === 0) {
      loadMovies();
    }
    if (!series || series.length === 0) {
      loadSeries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const featuredMovies = useMemo(
    () => (movies || []).slice(0, 6),
    [movies]
  );
  const featuredSeries = useMemo(
    () => (series || []).slice(0, 6),
    [series]
  );
  const recentMovies = useMemo(
    () =>
      (movies || [])
        .slice()
        .sort((a, b) => new Date(b.added).getTime() - new Date(a.added).getTime())
        .slice(0, 8),
    [movies]
  );

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to IPTV Player</h1>
          <p className="text-xl text-primary-100 mb-6">
            Stream your favorite movies and TV series in high quality
          </p>
          <div className="flex space-x-4">
            <Link
              to="/movies"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Browse Movies
            </Link>
            <Link
              to="/series"
              className="bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Browse Series
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-20 rounded-lg"></div>
      </div>

      {/* Featured Movies */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Star className="w-6 h-6 mr-2 text-yellow-400" />
            Featured Movies
          </h2>
          <Link
            to="/movies"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-lg aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredMovies.map((movie) => (
              <div
                key={movie.stream_id}
                className="group relative bg-dark-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => selectMovie(movie)}
              >
                <div className="aspect-[2/3] relative">
                  {movie.stream_icon ? (
                    <img
                      src={movie.stream_icon}
                      alt={movie.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                      <Play className="w-12 h-12 text-dark-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">
                    {movie.name}
                  </h3>
                  {movie.rating_5based > 0 && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-xs text-dark-300">
                        {movie.rating_5based.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Series */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
            Popular Series
          </h2>
          <Link
            to="/series"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-lg aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredSeries.map((series) => (
              <div
                key={series.series_id}
                className="group relative bg-dark-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => selectSeries(series)}
              >
                <div className="aspect-[2/3] relative">
                  {series.cover ? (
                    <img
                      src={series.cover}
                      alt={series.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                      <Play className="w-12 h-12 text-dark-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">
                    {series.name}
                  </h3>
                  {series.rating_5based > 0 && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-xs text-dark-300">
                        {series.rating_5based.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Added */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-400" />
            Recently Added
          </h2>
          <Link
            to="/movies"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-lg aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {recentMovies.map((movie) => (
              <div
                key={movie.stream_id}
                className="group relative bg-dark-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => selectMovie(movie)}
              >
                <div className="aspect-[2/3] relative">
                  {movie.stream_icon ? (
                    <img
                      src={movie.stream_icon}
                      alt={movie.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                      <Play className="w-8 h-8 text-dark-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-white font-medium text-xs line-clamp-2">
                    {movie.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
