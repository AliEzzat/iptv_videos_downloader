import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Layout from './components/Layout';
import Login from './components/Login';
import Home from './components/Home';
import BrowseMovies from './components/BrowseMovies';
import BrowseSeries from './components/BrowseSeries';
import VideoPlayer from './components/VideoPlayer';

function App() {
  const { isAuthenticated, selectedMovie, selectedSeries, selectMovie, selectSeries } = useAppStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<BrowseMovies />} />
            <Route path="/series" element={<BrowseSeries />} />
            <Route path="/search" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>

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

        {selectedSeries && (
          <VideoPlayer
            streamId={selectedSeries.series_id}
            streamType="series"
            title={selectedSeries.name}
            containerExtension={selectedSeries.container_extension}
            onClose={() => selectSeries(null)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
