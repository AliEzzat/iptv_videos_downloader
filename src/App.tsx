import { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Layout from './components/Layout';
import Login from './components/Login';
import Home from './components/Home';
import VideoPlayer from './components/VideoPlayer';
import BrowseMovies from './components/BrowseMovies';
import BrowseSeries from './components/BrowseSeries';
import BrowseLive from './components/BrowseLive';
import SeriesDetail from './components/SeriesDetail';

function VideoOverlay() {
  const navigate = useNavigate();
  const { movieId, seriesId, episodeId, liveId } = useParams();

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
  if (liveId) {
    return (
      <VideoPlayer
        streamId={liveId}
        streamType="live"
        title={`Live Channel ${liveId}`}
        onClose={handleClose}
      />
    );
  }
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };
  const navigate = useNavigate();
  const handleClose = () => {
      navigate(-1);
  };
  // Use backgroundLocation for main content, real location for overlays
  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<BrowseMovies />} />
        <Route path="/series" element={<BrowseSeries />} />
        <Route path="/live" element={<BrowseLive />} />
        <Route path="/series/:seriesId" element={<SeriesDetail onClose={handleClose}/>} />
        <Route path="/search" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Overlay: only render when overlay route matches */}
      {(location.pathname.match(/^\/movies\/[^/]+$/) ||
        location.pathname.match(/^\/series\/[^/]+\/episodes\/[^/]+$/) ||
        location.pathname.match(/^\/live\/[^/]+$/)) && (
        <Routes>
          <Route path="/movies/:movieId" element={<VideoOverlay />} />
          <Route path="/series/:seriesId/episodes/:episodeId" element={<VideoOverlay />} />
          <Route path="/live/:liveId" element={<VideoOverlay />} />
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
          <AppRoutes />
        </Layout>
      </div>
    </Router>
  );
}

export default App;
