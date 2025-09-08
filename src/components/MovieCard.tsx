import React from 'react';
import { Play, Download, Star, Calendar, Clock } from 'lucide-react';
import { type IPTVMovie } from '../types';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface MovieCardProps {
  movie: IPTVMovie;
  onPlay: (movie: IPTVMovie) => void;
  onDownload: (movie: IPTVMovie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPlay, onDownload }) => {
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(movie);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(movie);
  };

  return (
    <div className="group relative bg-dark-800 rounded-xl overflow-hidden shadow transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03]">
      <div className="aspect-[3/4] relative overflow-hidden">
        {movie.stream_icon ? (
          <LazyLoadImage
            src={movie.stream_icon}
            alt={movie.name}
            effect="blur"
            threshold={100}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-movie.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
            <Play className="w-16 h-16 text-dark-400" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        {/* Action buttons */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
            <button
              onClick={handlePlay}
              className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 ring-2 ring-primary-400/30"
              title="Play movie"
            >
              <Play className="w-7 h-7" />
            </button>
            <button
              onClick={handleDownload}
              className="bg-dark-600 hover:bg-dark-500 text-white p-4 rounded-full shadow-lg transition-all duration-200 ring-2 ring-dark-400/30"
              title="Download movie"
            >
              <Download className="w-7 h-7" />
            </button>
          </div>
        </div>
        {/* Rating badge */}
        {movie.rating_5based > 0 && (
          <div className="absolute top-2 right-2 bg-dark-900/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-semibold">
              {movie.rating_5based.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-xl mb-2 truncate group-hover:text-primary-400 transition-colors">
          {movie.name}
        </h3>
        <div className="space-y-2 text-sm text-dark-300">
          {movie.release_date && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>
          )}
          {movie.duration && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{movie.duration}</span>
            </div>
          )}
          {movie.genre && (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-dark-700 px-2 py-1 rounded">
                {movie.genre.split(',')[0].trim()}
              </span>
            </div>
          )}
        </div>
        {movie.plot && (
          <p className="text-dark-400 text-sm mt-3 line-clamp-3">
            {movie.plot}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
