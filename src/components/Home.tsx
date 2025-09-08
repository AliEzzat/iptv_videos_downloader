import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MovieCard from './MovieCard';
import SeriesCard from './SeriesCard';
import type { IPTVMovie, IPTVSeries } from '../types';

const Home: React.FC = () => {
  const { 
    movies, 
    series, 
    loadMovies, 
    loadSeries,
    selectSeries,
    isLoading 
  } = useAppStore();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadMovies();
    loadSeries();
  }, [loadMovies, loadSeries]);

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

  const handleSelectSeries = (seriesItem: IPTVSeries) => {
	  selectSeries(seriesItem);
    navigate(`/series/${seriesItem.series_id}`);
  };

  const handlePlayMovie = (movie: IPTVMovie) => {
    // Open overlay, keep Home as background
    navigate(`/movies/${movie.stream_id}`, { state: { backgroundLocation: location.pathname } });
  };

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
              <MovieCard
                key={movie.stream_id}
                movie={movie}
                onPlay={handlePlayMovie}
                onDownload={() => {}}
              />
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
              <SeriesCard
                key={series.series_id}
                series={series}
                onSelect={handleSelectSeries}
                onDownload={() => {}}
              />
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
              <MovieCard
                key={movie.stream_id}
                movie={movie}
                onPlay={handlePlayMovie}
                onDownload={() => {}}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
