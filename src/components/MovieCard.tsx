import React from 'react';
import { Play, Download, Star, Calendar, Clock } from 'lucide-react';
import { type IPTVMovie } from '../types';

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
    <div className="group relative bg-dark-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="aspect-[2/3] relative overflow-hidden">
        {movie.stream_icon ? (
          <img
            src={movie.stream_icon}
            alt={movie.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
            <button
              onClick={handlePlay}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full transition-colors duration-200"
              title="Play movie"
            >
              <Play className="w-6 h-6" />
            </button>
            <button
              onClick={handleDownload}
              className="bg-dark-600 hover:bg-dark-500 text-white p-3 rounded-full transition-colors duration-200"
              title="Download movie"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>
        </div>

        {movie.rating_5based > 0 && (
          <div className="absolute top-2 right-2 bg-dark-900/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">
              {movie.rating_5based.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
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
