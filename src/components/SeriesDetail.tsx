import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Calendar, Clock, Star, Users, Film, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { type IPTVEpisode } from '../types';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

interface SeriesDetailProps {
  onClose: () => void;
}

const SeriesDetail: React.FC<SeriesDetailProps> = ({ onClose }) => {
  const { 
    selectedSeries, 
    selectedSeriesDetail, 
    loadSeriesDetail, 
    selectEpisode,
    isLoading,
    error 
  } = useAppStore();
  
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (selectedSeries) {
      loadSeriesDetail(selectedSeries.series_id);
    }
  }, [selectedSeries, loadSeriesDetail]);

  const handlePlayEpisode = (episode: IPTVEpisode) => {
    // Open overlay, keep SeriesDetail as background
    selectEpisode(episode);
    navigate(`/series/${selectedSeries.series_id}/episodes/${episode.id}`, { state: { backgroundLocation: location.pathname } });
  };

  if (!selectedSeries || !selectedSeriesDetail) {
    return (
      <div className="fixed inset-0 bg-dark-900 z-50 flex items-center justify-center">
        <div className="text-white">Loading series details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-dark-900 z-50 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  const { info, episodes } = selectedSeriesDetail;
  const seasonEpisodes = episodes[selectedSeason.toString()] || [];

  const formatDuration = (duration: string) => {
    return duration || 'Unknown';
  };

  const formatRating = (rating: string) => {
    return rating ? `${rating}/10` : 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-dark-900 z-50 overflow-y-auto">
      {/* Header */}
      <div className="relative h-96 bg-gradient-to-b from-transparent to-dark-900">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{ backgroundImage: `url(${info.cover})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
        </div>
        
        <div className="relative z-10 p-6 h-full flex flex-col justify-end">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-white hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-white mb-4">{info.name}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-dark-300 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{formatRating(info.rating)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{info.releaseDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{info.episode_run_time} min</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {info.genre.split(',').map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm"
                >
                  {genre.trim()}
                </span>
          ))}
            </div>
            
            <p className="text-dark-300 text-lg leading-relaxed max-w-3xl">
              {info.plot}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Season Selector */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Seasons</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(episodes).map((seasonNum) => (
                <button
                  key={seasonNum}
                  onClick={() => setSelectedSeason(parseInt(seasonNum))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSeason === parseInt(seasonNum)
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  Season {seasonNum}
                </button>
              ))}
            </div>
          </div>

          {/* Episodes */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">
              Season {selectedSeason} Episodes
            </h3>
            
            {isLoading ? (
              <div className="text-dark-300">Loading episodes...</div>
            ) : seasonEpisodes.length === 0 ? (
              <div className="text-dark-300">No episodes available for this season.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {seasonEpisodes.map((episode) => (
          <div
            key={episode.id}
                    className="bg-dark-800 rounded-lg overflow-hidden hover:bg-dark-700 transition-colors cursor-pointer group"
                    onClick={() => handlePlayEpisode(episode)}
          >
                    <div className="aspect-video bg-dark-700 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">
                        {episode.title}
                      </h4>
                      
                      <div className="flex items-center justify-between text-sm text-dark-300">
                        <span>Episode {episode.episode_num}</span>
                        <span>{formatDuration(episode.info.duration)}</span>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-dark-400">
                          <Film className="w-4 h-4" />
                          <span className="text-xs">
                            {episode.info.video.width}x{episode.info.video.height}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download
                          }}
                          className="text-dark-400 hover:text-primary-400 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cast & Crew */}
          {info.cast && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Cast</h3>
              <div className="flex items-center gap-2 text-dark-300">
                <Users className="w-5 h-5" />
                <span>{info.cast}</span>
              </div>
            </div>
          )}

          {/* Director */}
          {info.director && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Director</h3>
              <div className="flex items-center gap-2 text-dark-300">
                <Film className="w-5 h-5" />
                <span>{info.director}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
