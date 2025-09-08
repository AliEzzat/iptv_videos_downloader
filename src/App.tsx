import React, { lazy, Suspense } from 'react';
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

  const handleClose = () => {
    if (seriesId && episodeId) {
      navigate(`/series/${seriesId}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

  if (movieId) {
    return (
      <VideoPlayer
        streamId={movieId}
        streamType="movie"
        title={`Movie ${movieId}`}
        onClose={handleClose}
      />
    );
  }
  if (seriesId && episodeId) {
    return (
      <VideoPlayer
        streamId={episodeId}
        streamType="series"
        title={`Episode ${episodeId}`}
        onClose={handleClose}
      />
    );
  }
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  // Use backgroundLocation for main content, real location for overlays
  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<BrowseMovies />} />
        <Route path="/series" element={<BrowseSeries />} />
        <Route path="/series/:seriesId" element={<SeriesDetail />} />
        <Route path="/search" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Overlay: only render when overlay route matches */}
      {(location.pathname.match(/^\/movies\/[^/]+$/) ||
        location.pathname.match(/^\/series\/[^/]+\/episodes\/[^/]+$/)) && (
        <Routes>
          <Route path="/movies/:movieId" element={<VideoOverlay />} />
          <Route path="/series/:seriesId/episodes/:episodeId" element={<VideoOverlay />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="App">
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
