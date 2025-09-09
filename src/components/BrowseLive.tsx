import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const BrowseLive: React.FC = () => {
  const {
    liveCategories,
    liveStreams,
    selectedLiveCategory,
    isLoading,
    error,
    loadLiveCategories,
    loadLiveStreams,
    setSelectedLiveCategory,
    selectLive
  } = useAppStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const streamsPerPage = 20;
  const streamsPerRow = 5;

  const categoryRef = useRef<HTMLSelectElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const streamRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    loadLiveCategories();
  }, [loadLiveCategories]);

  useEffect(() => {
    if (selectedLiveCategory) {
      loadLiveStreams(selectedLiveCategory);
    } else {
      loadLiveStreams();
    }
  }, [selectedLiveCategory, loadLiveStreams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gridRef.current) return;

      const totalStreams = liveStreams.length;
      const totalPages = Math.ceil(totalStreams / streamsPerPage);
      const startIndex = (currentPage - 1) * streamsPerPage;
      const endIndex = Math.min(startIndex + streamsPerPage, totalStreams);
      const streamsInCurrentPage = endIndex - startIndex;
      const maxIndex = streamsInCurrentPage - 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex >= streamsPerRow) {
            setFocusedIndex(focusedIndex - streamsPerRow);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex + streamsPerRow <= maxIndex) {
            setFocusedIndex(focusedIndex + streamsPerRow);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedIndex > 0) {
            setFocusedIndex(focusedIndex - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (focusedIndex < maxIndex) {
            setFocusedIndex(focusedIndex + 1);
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const selectedStream = liveStreams[startIndex + focusedIndex];
          if (selectedStream) {
            selectLive(selectedStream);
            window.location.href = `#/live/${selectedStream.stream_id}`;
          }
          break;
        case 'PageUp':
          e.preventDefault();
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setFocusedIndex(0);
          }
          break;
        case 'PageDown':
          e.preventDefault();
          if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setFocusedIndex(0);
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (categoryRef.current) {
            categoryRef.current.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, currentPage, liveStreams, selectLive]);

  useEffect(() => {
    if (streamRefs.current[focusedIndex]) {
      streamRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLiveCategory(e.target.value);
    setCurrentPage(1);
    setFocusedIndex(0);
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (gridRef.current) {
        gridRef.current.focus();
      }
    }
  };

  const startIndex = (currentPage - 1) * streamsPerPage;
  const endIndex = Math.min(startIndex + streamsPerPage, liveStreams.length);
  const currentStreams = liveStreams.slice(startIndex, endIndex);
  const totalPages = Math.ceil(liveStreams.length / streamsPerPage);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">Live Channels</h1>
        
        <div className="mb-4">
          <label htmlFor="category-select" className="block text-lg text-gray-300 mb-2">
            Category:
          </label>
          <select
            ref={categoryRef}
            id="category-select"
            value={selectedLiveCategory}
            onChange={handleCategoryChange}
            onKeyDown={handleCategoryKeyDown}
            className="w-64 px-4 py-3 text-lg bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            tabIndex={0}
          >
            <option value="">All Categories</option>
            {liveCategories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-gray-400 text-lg">
          Page {currentPage} of {totalPages} • {liveStreams.length} channels
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading live channels...</div>
        </div>
      ) : (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-5 gap-6 mb-6"
            tabIndex={0}
          >
            {currentStreams.map((stream, index) => (
              <div
                key={stream.stream_id}
                ref={(el) => (streamRefs.current[index] = el)}
                className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  index === focusedIndex ? 'ring-2 ring-blue-500 bg-gray-700' : ''
                }`}
                tabIndex={0}
                data-live-item
                onClick={() => {
                  selectLive(stream);
                  window.location.href = `#/live/${stream.stream_id}`;
                }}
              >
                <div className="aspect-video bg-gray-700 rounded-lg mb-3 overflow-hidden">
                  {stream.stream_icon ? (
                    <img
                      src={stream.stream_icon}
                      alt={stream.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-white text-lg font-semibold line-clamp-2 mb-2">
                  {stream.name}
                </h3>
                <div className="text-gray-400 text-sm">
                  ID: {stream.stream_id}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                    setFocusedIndex(0);
                  }
                }}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <span className="px-6 py-3 text-white text-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                    setFocusedIndex(0);
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseLive;
