import React from 'react';
import { Play, Download, Star, Calendar, Tv } from 'lucide-react';
import { type IPTVSeries } from '../types';

interface SeriesCardProps {
  series: IPTVSeries;
  onSelect: (series: IPTVSeries) => void;
  onDownload: (series: IPTVSeries) => void;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ series, onSelect, onDownload }) => {
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(series);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(series);
  };

  return (
    <div className="group relative bg-dark-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="aspect-[2/3] relative overflow-hidden">
        {series.stream_icon ? (
          <img
            src={series.stream_icon}
            alt={series.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-series.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
            <Tv className="w-16 h-16 text-dark-400" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
            <button
              onClick={handleSelect}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full transition-colors duration-200"
              title="View series"
            >
              <Play className="w-6 h-6" />
            </button>
            <button
              onClick={handleDownload}
              className="bg-dark-600 hover:bg-dark-500 text-white p-3 rounded-full transition-colors duration-200"
              title="Download series"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>
        </div>

        {series.rating_5based > 0 && (
          <div className="absolute top-2 right-2 bg-dark-900/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">
              {series.rating_5based.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {series.name}
        </h3>
        
        <div className="space-y-2 text-sm text-dark-300">
          {series.release_date && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(series.release_date).getFullYear()}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Tv className="w-4 h-4" />
            <span>TV Series</span>
          </div>
          
          {series.genre && (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-dark-700 px-2 py-1 rounded">
                {series.genre.split(',')[0].trim()}
              </span>
            </div>
          )}
        </div>

        {series.plot && (
          <p className="text-dark-400 text-sm mt-3 line-clamp-3">
            {series.plot}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeriesCard;
