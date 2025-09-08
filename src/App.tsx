import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Layout from './components/Layout';
import Login from './components/Login';
import Home from './components/Home';
import VideoPlayer from './components/VideoPlayer';

const BrowseMovies = lazy(() => import('./components/BrowseMovies'));
const BrowseSeries = lazy(() => import('./components/BrowseSeries'));
const SeriesDetail = lazy(() => import('./components/SeriesDetail'));

function VideoOverlay() {
  const navigate = useNavigate();
  const { movieId, seriesId, episodeId } = useParams();

  if (movieId) {
    return (
      <VideoPlayer
        streamId={movieId}
        streamType="movie"
        title={`Movie ${movieId}`}
        onClose={() => navigate(-1)}
      />
    );
  }
  if (seriesId && episodeId) {
    return (
      <VideoPlayer
        streamId={episodeId}
        streamType="series"
        title={`Episode ${episodeId}`}
        onClose={() => navigate(-1)}
      />
    );
  }
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: string };

  return (
    <>
      <Routes location={state?.backgroundLocation ? { ...location, pathname: state.backgroundLocation } : location}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<BrowseMovies />} />
        <Route path="/series" element={<BrowseSeries />} />
        <Route path="/series/:seriesId" element={<SeriesDetail />} />
        <Route path="/search" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Overlay routes */}
      <Routes>
        <Route path="/movies/:movieId" element={<VideoOverlay />} />
        <Route path="/series/:seriesId/episodes/:episodeId" element={<VideoOverlay />} />
      </Routes>
    </>
  );
}

function App() {
  const { 
    isAuthenticated, 
    selectedMovie, 
    selectedSeries, 
    selectedEpisode,
    selectMovie, 
    selectSeries,
    selectEpisode 
  } = useAppStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="App">
        <Layout>
          <AppRoutes />
        </Layout>

        {/* Series Detail Modal */}
        {selectedSeries && !selectedEpisode && (
          <SeriesDetail
            onClose={() => selectSeries(null)}
          />
        )}

        {/* Video Player Modal */}
        {selectedMovie && (
          <VideoPlayer
            streamId={selectedMovie.stream_id}
            streamType="movie"
            title={selectedMovie.name}
            containerExtension={selectedMovie.container_extension}
            onClose={() => selectMovie(null)}
          />
        )}

        {selectedEpisode && (
          <VideoPlayer
            streamId={selectedEpisode.id}
            streamType="series"
            title={selectedEpisode.title}
            containerExtension={selectedEpisode.container_extension}
            onClose={() => selectEpisode(null)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
